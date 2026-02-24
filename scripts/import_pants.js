
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const PARSE_2_DIR = path.join(process.cwd(), "parse_2");
const PANTS_IMAGES_BASE = path.join(PARSE_2_DIR, "2. Брюки");
const PUBLIC_PANTS_DIR = path.join(process.cwd(), "public", "images", "catalog", "pants");

if (!fs.existsSync(PUBLIC_PANTS_DIR)) {
  fs.mkdirSync(PUBLIC_PANTS_DIR, { recursive: true });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function parseValue(line, key) {
  if (!line.includes(`"${key}":`)) return null;
  const start = line.indexOf(":") + 1;
  let val = line.substring(start).trim();
  // Remove trailing semicolon if exists
  if (val.endsWith(";")) val = val.slice(0, -1);
  // Remove quotes if they wrap the value
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  return val;
}

async function importPants() {
  console.log("Starting pants import...");

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  const txtFiles = fs.readdirSync(PARSE_2_DIR).filter(f => f.endsWith(".txt") && f.startsWith("Брюки"));
  
  const pantsItems = [];

  for (const file of txtFiles) {
    const filePath = path.join(PARSE_2_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);

    const data = {};
    lines.forEach(line => {
      ["name", "price", "description", "sizes", "colors", "material", "characteristics", "article", "gender"].forEach(key => {
        const val = parseValue(line, key);
        if (val !== null) data[key] = val;
      });
    });

    const name = data.name || file.replace("Брюки ", "").replace(".txt", "");
    const modelKey = name.split(" (")[0].replace("Брюки ", "").trim();
    
    const pant = {
      id: `pant-${Date.now()}-${pantsItems.length}`,
      name: name,
      modelKey: modelKey, // For image matching
      price: parseInt(data.price) || 0,
      description: data.description || "",
      category: "Брюки",
      filterIds: ["filter-брюки"],
      tags: ["брюки", data.gender === "male" ? "мужские" : data.gender === "female" ? "женские" : "унисекс"],
      sizes: (data.sizes || "S, M, L, XL").split(",").map(s => s.trim()),
      colors: [],
      details: {
        material: data.material || "",
        characteristics: data.characteristics || "",
        article: data.article || ""
      },
      images: []
    };
    pantsItems.push(pant);
  }

  console.log(`Parsed ${pantsItems.length} pants models.`);

  const imageFolders = fs.readdirSync(PANTS_IMAGES_BASE);

  for (const pant of pantsItems) {
    const modelLower = pant.modelKey.toLowerCase();
    
    // Find matching folder
    let matchFolder = imageFolders.find(f => f.toLowerCase() === modelLower);
    if (!matchFolder) {
        // Try partial matches or special cases
        if (modelLower.includes("классик")) matchFolder = "Classic";
        else if (modelLower.includes("simple")) matchFolder = "Simple";
        else if (modelLower.includes("wide 2.0")) matchFolder = "Wide 20";
        else if (modelLower.includes("wide")) matchFolder = "Wide";
        else if (modelLower.includes("база")) matchFolder = "База";
        else if (modelLower.includes("палаццо")) matchFolder = "Палаццо Дуэт";
        else if (modelLower.includes("шелков")) matchFolder = "Шелковый путь";
        else if (modelLower === "man") matchFolder = "man и woman/Man";
        else if (modelLower === "woman") matchFolder = "man и woman/Woman";
    }

    if (matchFolder) {
      const folderPath = path.join(PANTS_IMAGES_BASE, matchFolder);
      const targetSubDirName = slugify(pant.modelKey);
      const targetSubDirPath = path.join(PUBLIC_PANTS_DIR, targetSubDirName);
      
      if (!fs.existsSync(targetSubDirPath)) {
        fs.mkdirSync(targetSubDirPath, { recursive: true });
      }

      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

      imageFiles.forEach((imgFile, index) => {
        const ext = path.extname(imgFile);
        const fileName = `${index + 1}${ext}`;
        const targetPath = path.join(targetSubDirPath, fileName);
        fs.copyFileSync(path.join(folderPath, imgFile), targetPath);
        
        pant.images.push(`/images/catalog/pants/${targetSubDirName}/${fileName}`);
      });
      console.log(`Copied ${imageFiles.length} images for ${pant.name}`);
    } else {
      console.warn(`No images found for ${pant.name} (searched for ${pant.modelKey})`);
      pant.images.push("/images/catalog-product.jpg");
    }

    pant.variants = pant.sizes.map(size => ({
      id: `${pant.id}-${size}`,
      size: size,
      price: pant.price,
      sku: pant.details.article
    }));

    delete pant.modelKey;
    products.push(pant);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log("Pants import completed!");
}

importPants().catch(console.error);
