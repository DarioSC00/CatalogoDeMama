import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;

if (apiKey && apiKey !== 'tu_api_key_aqui' && apiKey !== 'your-gemini-api-key') {
  ai = new GoogleGenAI({ apiKey });
}

/**
 * Generate an attractive description based on name and category.
 */
export async function generateProductDescription(name, category) {
  const cleanName = String(name || '').trim()
  const cleanCategory = String(category || '').trim()

  if (!cleanName || !cleanCategory) {
    throw new Error('Ingresa el nombre y la categoría antes de generar la descripción.')
  }

  // El formulario sigue funcionando aunque Gemini no esté configurado.
  if (!ai) {
    return `${cleanName} es una pieza especial de nuestra colección de ${cleanCategory}. Su diseño combina estilo, calidad y practicidad para acompañarte en cada ocasión. Descubre todos sus detalles y hazlo parte de tu selección.`
  }

  const prompt = `Actúa como un experto en redacción publicitaria (copywriting) para comercio electrónico.
Genera una descripción de producto atractiva y persuasiva para un producto llamado "${name}" que pertenece a la categoría "${category}".
La descripción debe ser corta (máximo 3 párrafos cortos), destacar los beneficios imaginarios que podría tener un producto de este tipo, y terminar con un llamado a la acción.
No uses emojis excesivos, mantén un tono profesional pero cercano.
Solo devuelve la descripción, nada de texto extra.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const generated = response.text?.trim()
  if (!generated) throw new Error('Gemini no devolvió una descripción.')
  return generated
}

/**
 * Convert a File object to base64.
 */
function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader result looks like "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze an image to suggest a category and tags.
 */
export async function analyzeProductImage(imageFile) {
  if (!ai) throw new Error('API Key de Gemini no configurada.');

  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `Analiza esta imagen de un producto.
Devuelve un objeto JSON estricto con el siguiente formato:
{
  "categoria": "Una categoría general (ej. Ropa, Calzado, Accesorio, Hogar, Electrónica, etc.)",
  "etiquetas": ["etiqueta1", "etiqueta2", "color principal", "estilo"]
}
Asegúrate de que la respuesta sea ÚNICAMENTE el JSON válido, sin bloques de código Markdown (\`\`\`).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [prompt, imagePart],
  });

  let text = response.text.trim();
  if (text.startsWith('\`\`\`json')) {
    text = text.substring(7, text.length - 3).trim();
  } else if (text.startsWith('\`\`\`')) {
    text = text.substring(3, text.length - 3).trim();
  }

  return JSON.parse(text);
}

/**
 * Answer a user's question about the catalog.
 */
export async function chatWithAssistant(userMessage, catalogProducts, chatHistory = []) {
  if (!ai) throw new Error('API Key de Gemini no configurada.');

  const systemInstruction = `Eres un amable y experto asistente de ventas virtual para nuestra tienda.
Tu trabajo es ayudar a los clientes a encontrar lo que buscan y responder sus preguntas.
Aquí está el catálogo actual de productos disponibles en formato JSON:
${JSON.stringify(catalogProducts, null, 2)}

Reglas:
1. Responde de manera concisa y amigable.
2. Si el usuario pide recomendaciones, busca en el catálogo y recomiéndale 1 o 2 productos que encajen.
3. Si recomiendas un producto, menciona su nombre y precio.
4. Si el usuario pregunta por algo que NO está en el catálogo, dile amablemente que por el momento no contamos con eso.
5. No inventes productos ni precios. Básate estrictamente en el JSON proporcionado.`;

  const contents = [];
  
  contents.push({
    role: 'user',
    parts: [{ text: systemInstruction }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: "¡Entendido! Estoy listo para ayudar a los clientes basándome en este catálogo." }]
  });

  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
  });

  return response.text.trim();
}

/**
 * Generate embedding for a given text using text-embedding-004
 */
export async function generateEmbedding(text) {
  if (!ai) throw new Error('API Key de Gemini no configurada.');

  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });
  
  return response.embeddings[0].values;
}
