import random
import csv

try:
    import pandas as pd
except ImportError:  # Optional dependency; fallback to csv writer if unavailable
    pd = None

# ============================================================
# MASTER CATEGORIES → SUBCATEGORIES
# ============================================================

CATEGORIES = {
    "Food & Dining": [
        "Restaurants", "Cafe", "Fast Food", "Swiggy", "Zomato",
        "Snacks", "Dessert"
    ],
    "Groceries": [
        "Vegetables", "Fruits", "Milk & Dairy", "Kirana Store",
        "Supermarket"
    ],
    "Travel": [
        "Flights", "Hotel Stay", "Business Trip", "Tour Packages"
    ],
    "Transport": [
        "Uber", "Ola", "Auto", "Taxi", "Bus", "Metro", "Train"
    ],
    "Fuel": ["Petrol", "Diesel", "CNG", "EV Charging"],
    "Bills & Utilities": [
        "Mobile Recharge", "Postpaid", "Electricity", "Water Bill",
        "Gas Bill", "Broadband/WiFi", "DTH/TV"
    ],
    "Entertainment": [
        "Movies", "OTT", "Events", "Concerts", "Gaming"
    ],
    "Shopping": [
        "Clothing", "Electronics", "Footwear", "Online Shopping",
        "Beauty Products"
    ],
    "Health & Medicine": [
        "Pharmacy", "Hospital", "Lab Tests", "Doctor Visit",
        "Medical Insurance"
    ],
    "Fitness & Sports": [
        "Gym Subscription", "Yoga Classes", "Sports Equipment"
    ],
    "Personal Care": ["Salon", "Spa", "Grooming"],
    "Education": ["Courses", "Coaching", "Online Tools", "Books"],
    "Subscriptions / Memberships": [
        "OTT", "Music", "YouTube Premium", "Apple Music",
        "Software Subscriptions"
    ],
    "Pet Care": ["Pet Food", "Vet Visits", "Accessories"],
    "Business / Work Expenses": [
        "Travel for Work", "Client Lunch", "Business Meetings",
        "Team Events"
    ],
    "Repairs & Maintenance": [
        "Bike Servicing", "Car Servicing",
        "Home Repair", "Electronics Repair"
    ],
    "Home Expenses": ["Rent", "Kitchen Items", "Cleaning Supplies"],
    "Gifts & Donations": ["Charity", "Gifting Items"],
    "Kids / Family": ["Baby Products", "School Fees"],
    "Investments": ["Mutual Funds", "Stocks", "Crypto", "FD/RD"],
    "Insurance": [
        "Vehicle Insurance", "Health Insurance", "Life Insurance"
    ],
    "Taxes": ["Income Tax", "GST Payment"],
    "Fees / Charges": ["Bank Fees", "Late Payment Fee"],
    "Miscellaneous / Other": ["Other"]
}

# ============================================================
# TEMPLATES (English + Hinglish)
# ============================================================

def build_templates():
    templates = {}

    def add(subcat, phrases):
        templates[subcat] = phrases

    # FOOD & DINING
    add("Restaurants", [
        "Ate {item} at {restaurant}",
        "Dinner at {restaurant}",
        "Ordered {item} via dine-in",
        "Aaj {restaurant} me {item} khaya",
    ])
    add("Cafe", [
        "Coffee at {restaurant}",
        "Visited {restaurant} for snacks",
        "{restaurant} se coffee aur {item} liya"
    ])
    add("Fast Food", [
        "Bought fast food: {item}",
        "Quick meal: {item} from {restaurant}"
    ])
    add("Swiggy", [
        "Swiggy order: {item}",
        "{item} Swiggy se mangwaya"
    ])
    add("Zomato", [
        "Zomato order placed for {item}",
        "Zomato se {item} mangaya"
    ])
    add("Snacks", [
        "Bought snacks: {item}",
        "{item} snacks liye"
    ])
    add("Dessert", [
        "Dessert treat: {item}",
        "Meetha liya: {item}"
    ])

    # GROCERIES
    add("Vegetables", [
        "Bought {item} from sabzi mandi",
        "DMart se {item} liya"
    ])
    add("Fruits", [
        "Purchased fresh {item}",
        "{item} fruit kharida"
    ])
    add("Milk & Dairy", [
        "Bought milk and dairy products",
        "Dairy products liye"
    ])
    add("Kirana Store", [
        "Daily kirana: {item}",
        "Kirana store se {item} liya"
    ])
    add("Supermarket", [
        "Supermarket shopping: {item}",
        "BigBazaar se {item} liya"
    ])

    # TRAVEL
    add("Flights", [
        "Booked flight to {place}",
        "Flight ticket to {place}"
    ])
    add("Hotel Stay", [
        "Stayed at hotel in {place}",
        "Hotel booking in {place}"
    ])
    add("Business Trip", [
        "Business trip to {place}",
        "Office trip to {place}"
    ])
    add("Tour Packages", [
        "Booked tour package to {place}",
        "Holiday package for {place}"
    ])

    # TRANSPORT
    add("Uber", [
        "Uber ride to {place}",
        "Uber liya {place} jane ke liye"
    ])
    add("Ola", [
        "Ola ride to {place}",
        "Ola se {place} gaya"
    ])
    add("Auto", [
        "Auto ride to {place}"
    ])
    add("Taxi", [
        "Taxi fare to {place}"
    ])
    add("Bus", [
        "Bus ticket to {place}"
    ])
    add("Metro", [
        "Metro ride to {place}"
    ])
    add("Train", [
        "Train ticket booked to {place}"
    ])

    # FUEL
    add("Petrol", ["Petrol bharwaya", "Petrol refill"])
    add("Diesel", ["Diesel refill"])
    add("CNG", ["CNG bharwaya"])
    add("EV Charging", ["EV charging session"])

    # BILLS & UTILITIES
    add("Mobile Recharge", [
        "Mobile recharge for {operator}",
        "{operator} ka recharge kiya"
    ])
    add("Postpaid", ["Paid postpaid bill for {operator}"])
    add("Electricity", ["Bijli ka bill bhara", "Electricity bill paid"])
    add("Water Bill", ["Pani ka bill bhara"])
    add("Gas Bill", ["Gas pipeline bill paid"])
    add("Broadband/WiFi", ["WiFi recharge", "Broadband bill paid"])
    add("DTH/TV", ["DTH recharge done"])

    # ENTERTAINMENT
    add("Movies", ["Watched movie at {cinema}"])
    add("OTT", ["Netflix subscription renewal", "Hotstar membership renewed"])
    add("Events", ["Attended event at {place}"])
    add("Concerts", ["Concert ticket for {artist}"])
    add("Gaming", ["Bought gaming item"])

    # SHOPPING
    add("Clothing", ["Bought clothes online"])
    add("Electronics", ["Purchased electronics"])
    add("Footwear", ["Bought shoes"])
    add("Online Shopping", ["Ordered {item} from Amazon"])
    add("Beauty Products", ["Bought beauty products"])

    # HEALTH & MEDICINE
    add("Pharmacy", ["Bought medicine: {medicine}"])
    add("Hospital", ["Paid hospital bill"])
    add("Lab Tests", ["Got lab tests done"])
    add("Doctor Visit", ["Doctor consultation fee"])
    add("Medical Insurance", ["Paid health insurance"])

    # FITNESS
    add("Gym Subscription", ["Gym subscription renewed"])
    add("Yoga Classes", ["Joined yoga classes"])
    add("Sports Equipment", ["Bought sports equipment"])

    # PERSONAL CARE
    add("Salon", ["Salon visit"])
    add("Spa", ["Spa session done"])
    add("Grooming", ["Bought grooming products"])

    # EDUCATION
    add("Courses", ["Purchased online course"])
    add("Coaching", ["Paid coaching fees"])
    add("Online Tools", ["Subscription for online tool"])
    add("Books", ["Bought books"])

    # SUBSCRIPTIONS
    add("Music", ["Spotify subscription renewal"])
    add("YouTube Premium", ["YouTube Premium renewed"])
    add("Apple Music", ["Apple Music payment"])
    add("Software Subscriptions", ["Paid for software subscription"])

    # PET CARE
    add("Pet Food", ["Bought pet food"])
    add("Vet Visits", ["Vet visit payment"])
    add("Accessories", ["Bought pet accessories"])

    # BUSINESS
    add("Travel for Work", ["Travel expense for work to {place}"])
    add("Client Lunch", ["Client lunch meeting"])
    add("Business Meetings", ["Business meeting expense"])
    add("Team Events", ["Team outing cost"])

    # REPAIRS
    add("Bike Servicing", ["Bike servicing completed"])
    add("Car Servicing", ["Car servicing cost"])
    add("Home Repair", ["Home repair expense"])
    add("Electronics Repair", ["Electronics repair charges"])

    # HOME
    add("Rent", ["Monthly rent paid"])
    add("Kitchen Items", ["Bought kitchen items"])
    add("Cleaning Supplies", ["Cleaning supplies bought"])

    # GIFTS
    add("Charity", ["Donation made"])
    add("Gifting Items", ["Bought gift items"])

    # KIDS/FAMILY
    add("Baby Products", ["Bought baby products"])
    add("School Fees", ["Paid school fees"])

    # INVESTMENTS
    add("Mutual Funds", ["Invested in MF"])
    add("Stocks", ["Bought stocks"])
    add("Crypto", ["Crypto investment"])
    add("FD/RD", ["Deposited in RD account"])

    # INSURANCE
    add("Vehicle Insurance", ["Vehicle insurance paid"])
    add("Health Insurance", ["Health insurance premium"])
    add("Life Insurance", ["Life insurance renewal"])

    # TAXES
    add("Income Tax", ["Income tax payment"])
    add("GST Payment", ["GST paid"])

    # FEES
    add("Bank Fees", ["Bank charge deducted"])
    add("Late Payment Fee", ["Late fee applied"])

    # MISC
    add("Other", ["Miscellaneous expense"])

    return templates


TEMPLATES = build_templates()

# ============================================================
# RANDOM DATA POOLS
# ============================================================

items = ["pizza","biryani","coffee","burger","pasta","fries",
         "milk","bread","eggs","rice","fruits","vegetables"]

restaurants = ["KFC","McDonald's","Dominos","Starbucks","Haldiram"]

places = ["airport","office","mall","station","home"]

operators = ["Jio","Airtel","VI","BSNL"]

medicine_items = ["paracetamol","dolo 650","crocin","cough syrup"]

cinemas = ["PVR","INOX","Cinepolis"]

artists = ["Arijit Singh","Badshah","Diljit Dosanjh"]

# ============================================================
# GENERATE 50,000 ROWS
# ============================================================

DATASET_SIZE = 50000
rows = []

for _ in range(DATASET_SIZE):
    master = random.choice(list(CATEGORIES.keys()))
    sub = random.choice(CATEGORIES[master])
    template = random.choice(TEMPLATES[sub])

    description = template.format(
        item=random.choice(items),
        restaurant=random.choice(restaurants),
        place=random.choice(places),
        operator=random.choice(operators),
        medicine=random.choice(medicine_items),
        cinema=random.choice(cinemas),
        artist=random.choice(artists)
    )

    rows.append([description, master, sub])

if pd:
    df = pd.DataFrame(rows, columns=["description", "master_category", "subcategory"])
    df.to_csv("expense_dataset_50000.csv", index=False)
else:
    with open("expense_dataset_50000.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["description", "master_category", "subcategory"])
        writer.writerows(rows)

print("Dataset generated: expense_dataset_50000.csv")
