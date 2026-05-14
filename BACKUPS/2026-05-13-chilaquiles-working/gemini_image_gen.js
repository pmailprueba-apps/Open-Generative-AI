const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyDh6wIPitn4xYwDXAdfVsDRbYEZ2B94Sh8';
const genAI = new GoogleGenerativeAI(API_KEY);

const prompt = `A high-resolution, professional menu poster for 'Aristeus Ruta 57', dimensions 1.20m x 0.80m, presented as a flat PNG file design. The background is a dark metallic blue with industrial textures and golden accents. It includes all sections from the user's menu: 'Chilaquiles De Autor' with photos of 'El Despertar de Aristeus' and 'Banquete del Patrón'; 'Delicias Del Mar' with 'Filetitos Dorados' and 'Sirena Aristeus'; and 'Los Toritos & Esferas' with 'Torito Imperial' and 'Esferas de Arroz'. The layout features clean typography, vibrant food photography, a QR code, and social media icons at the bottom. The overall look is premium and designed to be backlit by internal LED lights.`;

async function generateImage() {
  console.log('Starting image generation with gemini-3.1-flash-image-preview...');
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });
  const result = await model.generateContent(prompt);
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
          const outputPath = path.join(__dirname, `menu_aristeus_generated_${Date.now()}.${extension}`);
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(outputPath, buffer);
          console.log('Image saved to: ' + outputPath);
          return outputPath;
        }
      }
    }
  }
  console.log('No image in response.');
  return null;
}

generateImage().catch(console.error);
