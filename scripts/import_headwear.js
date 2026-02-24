
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const PARSE_4_DIR = path.join(process.cwd(), "parse_4");
const HEADWEAR_IMAGES_BASE = path.join(PARSE_4_DIR, "4. головные уборы");
const PUBLIC_HEADWEAR_DIR = path.join(process.cwd(), "public", "images", "catalog", "headwear");

if (!fs.existsSync(PUBLIC_HEADWEAR_DIR)) {
  fs.mkdirSync(PUBLIC_HEADWEAR_DIR, { recursive: true });
}

function slugify(text) {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH', 'Ы': 'Y', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
  };
  return text
    .toString()
    .split('')
    .map(char => ru[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function importHeadwear() {
  console.log("Starting headwear import...");

  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  // Remove existing headwear to avoid duplicates if re-running
  products = products.filter(p => p.category !== "Головные уборы");

  const content = fs.readFileSync(path.join(PARSE_4_DIR, "Головные уборы.txt"), "utf8");
  const blocks = content.split(/\r?\n\r?\n\r?\n/).filter(b => b.trim());
  
  const headwearItems = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const firstLine = lines[0];
    const priceMatch = firstLine.match(/(\d+)\s*[₽руб]/);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    const name = firstLine.replace(/(\d+)\s*[₽руб]/, "").trim();

    let description = "";
    let material = "";
    let characteristics = "";

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("Материал:")) {
            material = line.replace("Материал:", "").trim();
        } else if (line.startsWith("Хар-ки:")) {
            characteristics = line.replace("Хар-ки:", "").trim();
        } else if (!description) {
            description = line;
        } else if (line && !material && !characteristics) {
            description += " " + line;
        }
    }

    const headwear = {
      id: `headwear-${Date.now()}-${headwearItems.length}`,
      name: name,
      price: price,
      description: description,
      category: "Головные уборы",
      filterIds: ["filter-головные-уборы"],
      tags: ["головные уборы", "аксессуары"],
      sizes: ["One Size"],
      colors: [],
      details: {
        material: material,
        characteristics: characteristics,
        article: ""
      },
      images: []
    };
    headwearItems.push(headwear);
  }

  console.log(`Parsed ${headwearItems.length} headwear models.`);

  const imageFolders = fs.readdirSync(HEADWEAR_IMAGES_BASE);

  for (const item of headwearItems) {
    const nameLower = item.name.toLowerCase();
    
    let matchFolder = null;
    
    // Explicit mapping
    if (nameLower.includes("колпак поварской")) matchFolder = "Колпак";
    else if (nameLower.includes("simple")) matchFolder = "Simple";
    else if (nameLower.includes("морской узел")) matchFolder = "Морской узел";
    else if (nameLower.includes("шапка-бандана")) matchFolder = "Шапка-бандана";
    else if (nameLower.includes("докер")) matchFolder = "докер";
    else if (nameLower.includes("штормовой")) matchFolder = "штормовой колпак";
    else {
        matchFolder = imageFolders.find(f => nameLower.includes(f.toLowerCase()));
    }

    if (matchFolder) {
      const folderPath = path.join(HEADWEAR_IMAGES_BASE, matchFolder);
      const targetSubDirName = slugify(item.name);
      const targetSubDirPath = path.join(PUBLIC_HEADWEAR_DIR, targetSubDirName);
      
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
        
        item.images.push(`/images/catalog/headwear/${targetSubDirName}/${fileName}`);
      });
      console.log(`Copied ${imageFiles.length} images for ${item.name} from ${matchFolder}`);
    } else {
      console.warn(`No images found for ${item.name}`);
      item.images.push("/images/catalog-product.jpg");
    }

    item.variants = item.sizes.map(size => ({
      id: `${item.id}-${size}`,
      size: size,
      price: item.price,
      sku: ""
    }));

    products.push(item);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log("Headwear import completed!");
}

importHeadwear().catch(console.error);
