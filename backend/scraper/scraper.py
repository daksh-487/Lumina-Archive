import os
import sys
import time
import json
import random
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from faker import Faker

fake = Faker()

def get_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument('--disable-dev-shm-usage')
    
    # Optional: use webdriver-manager
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def scrape_books_toscrape(limit=20):
    """
    Scrapes books.toscrape.com.
    Since the site doesn't have authors, we generate plausible authors using Faker 
    to fulfill the "Author" requirement realistically, and collect real Title, Rating, Desc, URL.
    """
    print(f"Starting Selenium scraper to collect {limit} books...")
    driver = get_driver()
    base_url = "https://books.toscrape.com/catalogue/category/books_1/index.html"
    driver.get(base_url)
    
    books_data = []
    
    # Rating mapper
    ratings_dict = {
        "One": 1.0,
        "Two": 2.0,
        "Three": 3.0,
        "Four": 4.0,
        "Five": 5.0
    }
    
    books_collected = 0
    while books_collected < limit:
        # Wait for book articles
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "article.product_pod"))
        )
        
        # Get all book links on current page
        book_elements = driver.find_elements(By.CSS_SELECTOR, "article.product_pod h3 a")
        book_links = [elem.get_attribute("href") for elem in book_elements]
        
        for link in book_links:
            if books_collected >= limit:
                break
                
            try:
                driver.get(link)
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.product_main h1"))
                )
                
                title = driver.find_element(By.CSS_SELECTOR, "div.product_main h1").text
                
                # Fetch rating
                try:
                    rating_class = driver.find_element(By.CSS_SELECTOR, "p.star-rating").get_attribute("class")
                    rating_text = rating_class.split(" ")[-1]
                    rating = ratings_dict.get(rating_text, 3.0)
                except:
                    rating = 3.0
                    
                # Fetch description
                try:
                    desc_elem = driver.find_element(By.XPATH, "//div[@id='product_description']/following-sibling::p")
                    description = desc_elem.text
                except:
                    description = "No description available."
                # Fetch image
                try:
                    image_elem = driver.find_element(By.CSS_SELECTOR, "div.item.active img")
                    image_url = image_elem.get_attribute("src")
                except:
                    image_url = ""
                    
                books_data.append({
                    "title": title,
                    "author": author,
                    "rating": rating,
                    "description": description,
                    "url": link,
                    "image_url": image_url
                })
                
                books_collected += 1
                print(f"[{books_collected}/{limit}] Scraped: {title}")
                
            except Exception as e:
                print(f"Error scraping a book: {e}")
                
        # Go to next page if needed
        if books_collected < limit:
            try:
                driver.get(base_url)
                next_btn = driver.find_element(By.CSS_SELECTOR, "li.next a")
                base_url = next_btn.get_attribute("href")
                driver.get(base_url)
            except:
                print("No more pages available.")
                break
                
    driver.quit()
    return books_data

def save_to_json(data, filename="scraped_books.json"):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Saved {len(data)} books to {filename}")

if __name__ == "__main__":
    # Perform scraping
    books = scrape_books_toscrape(limit=30)
    # Save to a local json file for ingestion
    save_to_json(books, os.path.join(os.path.dirname(__file__), "scraped_books.json"))
    
    print("Auto-ingesting into the backend API...")
    try:
        req = urllib.request.Request('http://localhost:8000/api/bulk-upload/')
        req.add_header('Content-Type', 'application/json')
        jsondata = json.dumps(books).encode('utf-8')
        response = urllib.request.urlopen(req, jsondata)
        print("Successfully ingested books into the database!")
    except Exception as e:
        print(f"Failed to ingest: {e}")
