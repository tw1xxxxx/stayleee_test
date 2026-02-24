
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const PARSE_3_DIR = path.join(process.cwd(), "parse_3");
const APRONS_IMAGES_BASE = path.join(PARSE_3_DIR, "3. Фартуки");
const PUBLIC_APRONS_DIR = path.join(process.cwd(), "public", "images", "catalog", "aprons");

if (!fs.existsSync(PUBLIC_APRONS_DIR)) {
  fs.mkdirSync(PUBLIC_APRONS_DIR, { recursive: true });
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

function parseValue(line, key) {
  if (!line.includes(`"${key}":`)) return null;
  const start = line.indexOf(":") + 1;
  let val = line.substring(start).trim();
  if (val.endsWith(";")) val = val.slice(0, -1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  return val;
}

function getFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursive(filePath));
        } else {
            if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

async function importAprons() {
  console.log("Starting aprons import...");

  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  // Remove existing aprons to avoid duplicates if re-running
  products = products.filter(p => p.category !== "Фартуки");
  const txtFiles = fs.readdirSync(PARSE_3_DIR).filter(f => f.endsWith(".txt") && f.startsWith("Фартук"));
  
  const apronItems = [];

  for (const file of txtFiles) {
    const filePath = path.join(PARSE_3_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);

    const data = {};
    lines.forEach(line => {
      ["name", "price", "description", "sizes", "colors", "material", "characteristics", "article", "gender"].forEach(key => {
        const val = parseValue(line, key);
        if (val !== null) data[key] = val;
      });
    });

    const name = data.name || file.replace(".txt", "");
    const modelKey = name.replace("Фартук ", "").split(" (")[0].trim();
    
    const apron = {
      id: `apron-${Date.now()}-${apronItems.length}`,
      name: name,
      modelKey: modelKey,
      price: parseInt(data.price) || 0,
      description: data.description || "",
      category: "Фартуки",
      filterIds: ["filter-фартуки"],
      tags: ["фартук", "низ"],
      sizes: (data.sizes || "S, M, L, XL").split(",").map(s => s.trim()),
      colors: data.colors ? data.colors.split(",").map(c => c.trim()).filter(Boolean) : [],
      details: {
        material: data.material || "",
        characteristics: data.characteristics || "",
        article: data.article || ""
      },
      images: []
    };
    apronItems.push(apron);
  }

  console.log(`Parsed ${apronItems.length} apron models.`);

  const imageFolders = fs.readdirSync(APRONS_IMAGES_BASE);

  for (const apron of apronItems) {
    const modelLower = apron.modelKey.toLowerCase();
    
    let matchFolder = null;
    
    // Explicit mapping for tricky cases
    if (modelLower.includes("inspire")) matchFolder = "Inspire";
    else if (modelLower.includes("nonna")) {
        if (apron.name.toLowerCase().includes("джинсовый")) matchFolder = "Nonna/Джинсовый";
        else matchFolder = "Nonna/Белый";
    }
    else if (modelLower.includes("simple")) matchFolder = "Simple";
    else if (modelLower.includes("индустриал")) matchFolder = "Индустриал";
    else if (modelLower.includes("плиссе")) matchFolder = "Плиссе";
    else if (modelLower.includes("поясно")) matchFolder = "поясной";
    else {
        // Fallback for direct matches
        matchFolder = imageFolders.find(f => f.toLowerCase() === modelLower);
    }

    if (matchFolder) {
      const folderPath = path.join(APRONS_IMAGES_BASE, matchFolder);
      const targetSubDirName = slugify(apron.name);
      const targetSubDirPath = path.join(PUBLIC_APRONS_DIR, targetSubDirName);
      
      if (!fs.existsSync(targetSubDirPath)) {
        fs.mkdirSync(targetSubDirPath, { recursive: true });
      }

      const allImageFiles = getFilesRecursive(folderPath);

      allImageFiles.forEach((imgFile, index) => {
        const ext = path.extname(imgFile);
        const fileName = `${index + 1}${ext}`;
        const targetPath = path.join(targetSubDirPath, fileName);
        fs.copyFileSync(imgFile, targetPath);
        
        apron.images.push(`/images/catalog/aprons/${targetSubDirName}/${fileName}`);
      });
      console.log(`Copied ${allImageFiles.length} images for ${apron.name} from ${matchFolder}`);
    } else {
      console.warn(`No images found for ${apron.name} (searched for ${apron.modelKey})`);
      apron.images.push("/images/catalog-product.jpg");
    }

    apron.variants = apron.sizes.map(size => ({
      id: `${apron.id}-${size}`,
      size: size,
      price: apron.price,
      sku: apron.details.article
    }));

    delete apron.modelKey;
    products.push(apron);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log("Aprons import completed!");
}

importAprons().catch(console.error);
