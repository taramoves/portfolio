# 🚀 Airtable Import Instructions

## Step 1: Create New Base
1. Go to Airtable.com and log in
2. Click "Create a base"
3. Choose "Import data" instead of "Start from scratch"
4. Select "CSV file"

## Step 2: Import Projects Table (Main Table)
1. **Upload:** `projects.csv`
2. **Table name:** "Projects"
3. **Primary field:** "Title"
4. **Click "Import"**

This will create your main Projects table with all the enhanced fields!

## Step 3: Import Additional Tables
1. **Click the "+" next to the Projects tab**
2. **Choose "Import data" → "CSV file"**
3. **Import in this order:**
   - `media-assets.csv` → Name: "Media Assets"
   - `exhibitions.csv` → Name: "Exhibitions" 
   - `collaborators.csv` → Name: "Collaborators"
   - `workshops-talks.csv` → Name: "Workshops & Talks"

## Step 4: Set Up Relationships
After importing, you need to link the tables:

### In Projects Table:
1. **Add field:** "Exhibition History"
   - Type: Link to "Exhibitions" table
2. **Add field:** "Project Collaborators" 
   - Type: Link to "Collaborators" table
3. **Add field:** "Media Assets"
   - Type: Link to "Media Assets" table
4. **Add field:** "Related Workshops"
   - Type: Link to "Workshops & Talks" table

### In Media Assets Table:
- The "Linked Project" field should automatically link to Projects

### In Exhibitions Table:
- The "Featured Projects" field should automatically link to Projects

### In Collaborators Table:
- The "Projects Together" field should automatically link to Projects

### In Workshops & Talks Table:
- The "Related Projects" field should automatically link to Projects
- The "Collaborators" field should automatically link to Collaborators

## Step 5: Clean Up Sample Data
- **Delete the 3 sample projects** if you don't want them
- **Delete sample media assets, exhibitions, collaborators, and workshops**
- **Keep the field structure** - that's what we want!

## Step 6: Get API Info
1. Go to Airtable.com/api
2. Select your new base
3. Copy the Base ID (starts with "app...")
4. Create a personal access token in your account settings

## ✅ You're Done!
Your database now has:
- ✅ Enhanced Projects table with 20+ fields
- ✅ Media Assets table for better file management
- ✅ Exhibitions table for professional context
- ✅ Collaborators table for credits
- ✅ Workshops & Talks table for educational activities
- ✅ Proper relationships between all tables
- ✅ Sample data showing how it all works

**Next:** Update your website code to use the new field names! 