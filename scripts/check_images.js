
import fs from "node:fs";
import path from "node:path";

const productsPath = path.join(process.cwd(), "data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

const publicDir = path.join(process.cwd(), "public");

let missingImages = [];

products.forEach(product => {
  const images = product.images || [];
  images.forEach(imagePath => {
    // Skip external images if any (though they seem local)
    if (imagePath.startsWith("http")) return;

    // Remove query params if any
    const cleanPath = imagePath.split("?")[0];
    const fullPath = path.join(publicDir, cleanPath);

    if (!fs.existsSync(fullPath)) {
      missingImages.push({
        productId: product.id,
        productName: product.name,
        imagePath: imagePath
      });
    }
  });
});

if (missingImages.length > 0) {
  console.log("Found missing images:");
  console.log(JSON.stringify(missingImages, null, 2));
} else {
  console.log("All images exist.");
}
