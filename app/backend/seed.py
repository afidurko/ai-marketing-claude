import json
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from database import SessionLocal
from models import AnalyticsEvent, Card, CardStatus

SEED_CARDS = [
    {"player_name": "Mickey Mantle", "year": 1952, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 125000, "rarity": "Legendary", "description": "Iconic '52 Topps high-number Mantle — the crown jewel of post-war baseball cards.", "image_url": "https://images.unsplash.com/photo-1566577739334-ee0c882d4b9d?w=400&h=560&fit=crop"},
    {"player_name": "Babe Ruth", "year": 1933, "set_name": "Goudey", "grade": "7", "grader": "PSA", "condition": "Near Mint", "price": 45000, "rarity": "Legendary", "description": "1933 Goudey #53 — the Sultan of Swat in vivid yellow.", "image_url": "https://images.unsplash.com/photo-1521417530959-9f3a5d3e8f1a?w=400&h=560&fit=crop"},
    {"player_name": "Hank Aaron", "year": 1954, "set_name": "Topps", "grade": "9", "grader": "PSA", "condition": "Mint", "price": 89000, "rarity": "Legendary", "description": "Rookie card of Hammerin' Hank — pristine centering and color.", "image_url": "https://images.unsplash.com/photo-1518604666860-9ceca57f847c?w=400&h=560&fit=crop"},
    {"player_name": "Willie Mays", "year": 1952, "set_name": "Topps", "grade": "6", "grader": "PSA", "condition": "Excellent-Mint", "price": 22000, "rarity": "Rare", "description": "Say Hey Kid's first Topps card — strong eye appeal.", "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406fe?w=400&h=560&fit=crop"},
    {"player_name": "Roberto Clemente", "year": 1955, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 35000, "rarity": "Rare", "description": "Clemente's rookie card with sharp corners and rich color.", "image_url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=560&fit=crop"},
    {"player_name": "Ted Williams", "year": 1939, "set_name": "Play Ball", "grade": "5", "grader": "PSA", "condition": "Excellent", "price": 18000, "rarity": "Rare", "description": "Splendid Splinter rookie — classic pre-war cardboard.", "image_url": "https://images.unsplash.com/photo-1471297340917-ee8ae630bb71?w=400&h=560&fit=crop"},
    {"player_name": "Jackie Robinson", "year": 1948, "set_name": "Leaf", "grade": "4", "grader": "PSA", "condition": "Very Good-Excellent", "price": 28000, "rarity": "Legendary", "description": "Historic rookie of the man who broke baseball's color barrier.", "image_url": "https://images.unsplash.com/photo-1568602471122-7831631a4a90?w=400&h=560&fit=crop"},
    {"player_name": "Sandy Koufax", "year": 1955, "set_name": "Topps", "grade": "7", "grader": "PSA", "condition": "Near Mint", "price": 8500, "rarity": "Uncommon", "description": "Koufax rookie with clean surfaces and strong registration.", "image_url": "https://images.unsplash.com/photo-1531418841129-75b6b45aecb9?w=400&h=560&fit=crop"},
    {"player_name": "Stan Musial", "year": 1948, "set_name": "Leaf", "grade": "6", "grader": "PSA", "condition": "Excellent-Mint", "price": 6200, "rarity": "Uncommon", "description": "Stan the Man — vibrant red background Leaf rookie.", "image_url": "https://images.unsplash.com/photo-1587284206013-0f8d5a5c5f1a?w=400&h=560&fit=crop"},
    {"player_name": "Lou Gehrig", "year": 1933, "set_name": "Goudey", "grade": "5", "grader": "PSA", "condition": "Excellent", "price": 15000, "rarity": "Rare", "description": "Iron Horse Goudey portrait — timeless Yankee legend.", "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=560&fit=crop"},
    {"player_name": "Ty Cobb", "year": 1909, "set_name": "T206", "grade": "3", "grader": "PSA", "condition": "Very Good", "price": 32000, "rarity": "Legendary", "description": "T206 green portrait — the most collected set in the hobby.", "image_url": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&h=560&fit=crop"},
    {"player_name": "Cy Young", "year": 1909, "set_name": "T206", "grade": "2", "grader": "PSA", "condition": "Good", "price": 9500, "rarity": "Rare", "description": "Portrait of the pitcher whose name defines excellence.", "image_url": "https://images.unsplash.com/photo-1519861530253-cfa0ef0854aa?w=400&h=560&fit=crop"},
    {"player_name": "Joe DiMaggio", "year": 1939, "set_name": "Play Ball", "grade": "6", "grader": "PSA", "condition": "Excellent-Mint", "price": 11000, "rarity": "Uncommon", "description": "Yankee Clipper Play Ball — elegant pre-war design.", "image_url": "https://images.unsplash.com/photo-1566577739334-ee0c882d4b9d?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Nolan Ryan", "year": 1968, "set_name": "Topps", "grade": "9", "grader": "PSA", "condition": "Mint", "price": 4200, "rarity": "Uncommon", "description": "Ryan Express rookie — blazing fastball immortalized in cardboard.", "image_url": "https://images.unsplash.com/photo-1518604666860-9ceca57f847c?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Reggie Jackson", "year": 1969, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 2800, "rarity": "Common", "description": "Mr. October's rookie — clean white borders.", "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406fe?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Cal Ripken Jr.", "year": 1982, "set_name": "Topps Traded", "grade": "10", "grader": "PSA", "condition": "Gem Mint", "price": 6500, "rarity": "Rare", "description": "Iron Man gem mint rookie — perfect grade pop favorite.", "image_url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Ken Griffey Jr.", "year": 1989, "set_name": "Upper Deck", "grade": "10", "grader": "PSA", "condition": "Gem Mint", "price": 3200, "rarity": "Uncommon", "description": "The Kid's iconic Upper Deck rookie — hobby revolution card.", "image_url": "https://images.unsplash.com/photo-1471297340917-ee8ae630bb71?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Pete Rose", "year": 1963, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 4500, "rarity": "Uncommon", "description": "Charlie Hustle rookie — all-time hits leader.", "image_url": "https://images.unsplash.com/photo-1568602471122-7831631a4a90?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Yogi Berra", "year": 1948, "set_name": "Bowman", "grade": "7", "grader": "PSA", "condition": "Near Mint", "price": 7800, "rarity": "Uncommon", "description": "Yogi Bowman rookie — Hall of Fame catcher and wit.", "image_url": "https://images.unsplash.com/photo-1531418841129-75b6b45aecb9?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Ernie Banks", "year": 1954, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 5200, "rarity": "Uncommon", "description": "Mr. Cub's rookie — Let's play two!", "image_url": "https://images.unsplash.com/photo-1587284206013-0f8d5a5c5f1a?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Bob Gibson", "year": 1959, "set_name": "Topps", "grade": "9", "grader": "PSA", "condition": "Mint", "price": 3100, "rarity": "Common", "description": "Gibby rookie — dominant Cardinals ace.", "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Frank Robinson", "year": 1956, "set_name": "Topps", "grade": "8", "grader": "PSA", "condition": "Near Mint-Mint", "price": 4800, "rarity": "Uncommon", "description": "Rookie card of the only player to win MVP in both leagues.", "image_url": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Roger Maris", "year": 1958, "set_name": "Topps", "grade": "7", "grader": "PSA", "condition": "Near Mint", "price": 2400, "rarity": "Common", "description": "61-homer season hero — clean '58 Topps.", "image_url": "https://images.unsplash.com/photo-1519861530253-cfa0ef0854aa?w=400&h=560&fit=crop&q=80"},
    {"player_name": "Tony Gwynn", "year": 1983, "set_name": "Topps", "grade": "9", "grader": "PSA", "condition": "Mint", "price": 1800, "rarity": "Common", "description": "Mr. Padre rookie — master of the art of hitting.", "image_url": "https://images.unsplash.com/photo-1566577739334-ee0c882d4b9d?w=400&h=560&fit=crop&q=85"},
]


def seed_database() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(Card).count() > 0:
            return

        for data in SEED_CARDS:
            db.add(Card(**data, status=CardStatus.AVAILABLE))

        now = datetime.utcnow()
        sample_events = [
            ("page_view", {"page": "inventory"}),
            ("page_view", {"page": "home"}),
            ("search", {"query": "mantle"}),
            ("search", {"query": "1952 topps"}),
            ("card_view", {"card_id": 1}),
            ("card_view", {"card_id": 3}),
            ("page_view", {"page": "inventory"}),
        ]
        for i, (event_type, meta) in enumerate(sample_events):
            db.add(
                AnalyticsEvent(
                    event_type=event_type,
                    metadata_json=json.dumps(meta),
                    timestamp=now - timedelta(days=6 - i, hours=i * 3),
                )
            )

        db.commit()
    finally:
        db.close()
