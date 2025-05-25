// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const distPath = path.join(__dirname, 'dist');

// Debug: Verifica se a pasta dist existe
if (!fs.existsSync(distPath)) {
  console.error(`❌ Pasta dist NÃO EXISTE em ${distPath}`);
} else {
  console.log(`✅ Pasta dist encontrada! Conteúdo:`, fs.readdirSync(distPath));
}

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});
