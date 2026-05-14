const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyDh6wIPitn4xYwDXAdfVsDRbYEZ2B94Sh8';
const genAI = new GoogleGenerativeAI(API_KEY);

const outputDir = path.join(__dirname, 'campana-redes');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  {
    name: 'anuncio-1-chilaquiles-verdes',
    prompt: `Professional food photography of chilaquiles verdes - crispy corn tortilla chips bathed in vibrant green salsa, topped with tender pulled chicken, crumbled white cheese, Mexican cream, diced onions and fresh cilantro. Dark charcoal background to make colors pop. Soft dramatic lighting from above. The chips should have varying textures - some still crispy, others softened by the salsa. Garnish with a wedge of lime and green chili. Ultra appetizing, high-end restaurant quality, 4K, photorealistic, shallow depth of field, food magazine cover style.`
  },
  {
    name: 'anuncio-2-chilaquiles-rojos',
    prompt: `Professional food photography of chilaquiles rojos - crispy corn tortilla chips bathed in rich deep red salsa, topped with perfectly fried eggs with runny yolks, pulled chicken, crumbled white cheese, Mexican cream, sliced radishes and fresh cilantro. Bright warm natural lighting from a window. Vibrant colors - the red salsa should be rich and glossy. The eggs should look incredibly delicious with golden yolks. Clean but not sterile background. Instagram food porn aesthetic, 4K, photorealistic, shallow depth of field, top-down and angled view showing the full plate.`
  },
  {
    name: 'anuncio-3-desayuno-campeon',
    prompt: `Professional menu catalog photography of chilaquiles especiales - a generous plate showing abundant chilaquiles with chicken, egg, cheese, cream, onions and cilantro. Warm restaurant lighting, wooden table background with a checkered tablecloth. The portion should look HUGE and satisfying - this is a champion breakfast. Side view showing the layers of crispy chips, tender chicken, melted cheese stretching. Clean commercial food catalog style, soft shadows, 4K, photorealistic, full plate in frame, appetizing and inviting, professional food branding photography.`
  }
];

async function generateImage(imageConfig) {
  console.log(`Generating: ${imageConfig.name}`);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });
  const result = await model.generateContent(imageConfig.prompt);
  const response = result.response;

  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    if (candidate.content && candidate.content.parts) {
      for (let i = 0; i < candidate.content.parts.length; i++) {
        const part = candidate.content.parts[i];
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const extension = mimeType.split('/')[1];
          const outputPath = path.join(outputDir, `${imageConfig.name}.${extension}`);
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(outputPath, buffer);
          console.log(`  ✓ Saved: ${outputPath}`);
          return outputPath;
        }
      }
    }
  }
  console.log(`  ✗ No image in response for ${imageConfig.name}`);
  return null;
}

async function generateAll() {
  console.log('🎨 Generando imágenes para campaña ARISTEUS CHILAQUILES\n');

  for (const imageConfig of images) {
    await generateImage(imageConfig);
    // Small delay between generations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Generación completa!');
}

generateAll().catch(console.error);