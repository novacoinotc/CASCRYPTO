# 🚀 Cómo Publicar tu Casino en Vercel - Paso a Paso

Esta guía te muestra EXACTAMENTE cómo publicar tu casino en internet usando Vercel (gratis).

## ✅ Antes de Empezar

Asegúrate de haber completado:
- ✅ Desplegado los contratos en Polygon Mumbai (`npm run deploy:mumbai`)
- ✅ Guardado las direcciones de los contratos
- ✅ Configurado `frontend/src/config.js` con esas direcciones

---

## 📦 Parte 1: Preparar el Proyecto

### Paso 1: Verificar que el Frontend Funciona Localmente

1. Abre terminal en la carpeta `CASCRYPTO/frontend`
   ```bash
   cd frontend
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en: http://localhost:3000

5. Deberías ver tu casino. Prueba:
   - Conectar wallet
   - Hacer una apuesta
   - Ver si todo funciona

6. Si funciona, presiona `Ctrl+C` para detener el servidor

### Paso 2: Construir para Producción

```bash
npm run build
```

Deberías ver:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization
```

Si hay errores, corrígelos antes de continuar.

---

## 🌐 Parte 2: Crear Cuenta en Vercel

### Paso 1: Registrarse

1. Ve a: https://vercel.com
2. Click "Sign Up" (Registrarse)
3. Selecciona "Continue with GitHub"
4. Esto te redirige a GitHub
5. Click "Authorize Vercel" (Autorizar Vercel)
6. Listo, ya tienes cuenta en Vercel

---

## 📤 Parte 3: Subir tu Código a GitHub

### Paso 1: Crear un Repositorio en GitHub

1. Ve a: https://github.com
2. Click el botón "+" arriba a la derecha
3. Click "New repository"
4. Rellena:
   - **Repository name:** `mi-casino-web3` (o el nombre que quieras)
   - **Description:** "Casino descentralizado en Web3"
   - **Visibility:** Private (recomendado) o Public
5. **NO marques** "Add a README file"
6. Click "Create repository"

### Paso 2: Subir tu Código

GitHub te mostrará instrucciones. En tu terminal (en la carpeta `CASCRYPTO`):

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Casino completo listo para deploy"

# Agregar remote (REEMPLAZA TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/mi-casino-web3.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

Te pedirá tu usuario y contraseña de GitHub. Escríbelos y presiona Enter.

**Nota:** Si usa autenticación de 2 factores, necesitas crear un Personal Access Token:
1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Marca "repo"
4. Click "Generate token"
5. Copia el token (empieza con `ghp_...`)
6. Úsalo en lugar de tu contraseña

### Paso 3: Verificar

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/mi-casino-web3`
2. Deberías ver todos tus archivos
3. Si los ves, ¡perfecto! Continúa

---

## 🎯 Parte 4: Desplegar en Vercel

### Opción A: Desde la Web (MÁS FÁCIL)

#### Paso 1: Importar Proyecto

1. Ve a: https://vercel.com/dashboard
2. Click "Add New..." (arriba a la derecha)
3. Click "Project"
4. Verás tus repositorios de GitHub
5. Busca `mi-casino-web3`
6. Click "Import" al lado de tu repositorio

#### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es Next.js. Configura:

1. **Project Name:** `mi-casino` (o el que quieras)
2. **Framework Preset:** Next.js (ya debería estar seleccionado)
3. **Root Directory:** Click "Edit" y selecciona `frontend`
   - Muy importante: debe apuntar a la carpeta frontend
4. **Build Command:** `npm run build` (ya viene por defecto)
5. **Output Directory:** `.next` (ya viene por defecto)
6. **Install Command:** `npm install` (ya viene por defecto)

**Environment Variables** (Opcional):
- Por ahora déjalo vacío
- Las direcciones de contratos ya están en `config.js`

#### Paso 3: Desplegar

1. Click "Deploy" (botón azul grande)
2. Vercel empezará a construir tu proyecto
3. Verás el progreso en tiempo real:
   ```
   ⏳ Queued
   🔨 Building
   ✅ Completed
   ```
4. Esto tarda 2-5 minutos

#### Paso 4: ¡Tu Casino Está Publicado!

Cuando termine, verás:

```
🎉 Congratulations!
Your project has been successfully deployed.
```

Y una URL como:
```
https://mi-casino-xyz123.vercel.app
```

**¡ESA ES TU PÁGINA WEB PÚBLICA!**

### Copiar la URL

1. Click en la URL
2. Se abrirá tu casino en una nueva pestaña
3. Comparte esa URL con quien quieras

---

## 🎮 Parte 5: Probar tu Casino Publicado

### Paso 1: Abrir tu Casino

1. Ve a tu URL: `https://mi-casino-xyz123.vercel.app`
2. Deberías ver la pantalla de bienvenida

### Paso 2: Conectar MetaMask

1. Click "Conectar Wallet"
2. MetaMask se abrirá
3. Asegúrate de estar en "Polygon Mumbai"
4. Click "Connect"

### Paso 3: Jugar

1. Selecciona un juego (CoinFlip, Dice, o Roulette)
2. Coloca una apuesta
3. Confirma en MetaMask
4. ¡Espera el resultado!

### Paso 4: Compartir

Tu casino ya está en internet. Comparte la URL con:
- Amigos
- Redes sociales
- Donde quieras

---

## 🔧 Parte 6: Configuración Avanzada

### Obtener un Dominio Personalizado

En lugar de `mi-casino-xyz123.vercel.app`, puedes tener `micasino.com`:

1. Compra un dominio en:
   - Namecheap.com
   - GoDaddy.com
   - Google Domains
2. En Vercel:
   - Ve a tu proyecto
   - Click "Settings"
   - Click "Domains"
   - Click "Add"
   - Escribe tu dominio
   - Sigue las instrucciones para conectarlo

### Actualizar el Casino

Si haces cambios y quieres actualizarlos:

1. Haz tus cambios en el código
2. En terminal:
   ```bash
   git add .
   git commit -m "Actualización del casino"
   git push
   ```
3. Vercel automáticamente detecta el cambio
4. Construye y despliega la nueva versión
5. En 2-3 minutos, los cambios están en vivo

**¡Es AUTOMÁTICO!** No necesitas hacer nada más.

### Ver Estadísticas

En tu dashboard de Vercel puedes ver:
- 📊 Cuántas visitas tiene tu sitio
- 🌍 De qué países vienen
- ⏱️ Tiempo de carga
- 🐛 Errores (si hay)

---

## 🆘 Solución de Problemas

### Build Failed (Construcción Falló)

**Problema:** Vercel muestra un error al construir

**Solución:**
1. Click en "View Build Logs"
2. Lee el error
3. Comunes:
   - "Module not found" → Verifica que instalaste todas las dependencias
   - "Syntax error" → Hay un error de código, revisa el archivo mencionado
   - "Failed to compile" → Revisa que `npm run build` funcione localmente

### 404 - Page Not Found

**Problema:** Al abrir tu URL sale "404 Not Found"

**Solución:**
1. Verifica que el Root Directory sea `frontend`
2. En Vercel → Settings → General → Root Directory
3. Debe decir: `frontend`
4. Si no, edítalo y redespliega

### "Wrong Network"

**Problema:** El sitio pide cambiar de red

**Solución:**
1. Abre MetaMask
2. Cambia a "Polygon Mumbai"
3. Recarga la página

### No Puedo Conectar MetaMask

**Problema:** MetaMask no se abre

**Solución:**
1. Verifica que MetaMask esté instalado
2. Prueba en modo incógnito
3. Prueba en otro navegador (Chrome, Brave, Firefox)
4. Verifica que tu navegador permita pop-ups

### Las Transacciones Fallan

**Problema:** Transacciones siempre fallan

**Solución:**
1. Verifica que las direcciones en `config.js` sean correctas
2. Verifica que tengas MATIC en Mumbai
3. Abre consola del navegador (F12) y busca errores
4. Verifica que los contratos estén desplegados correctamente

---

## 📊 Métricas y Monitoreo

### Ver Analytics

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto
3. Click en "Analytics"
4. Verás:
   - Visitantes por día
   - Páginas más vistas
   - Performance
   - Errores

### Configurar Alertas

1. Settings → Notifications
2. Activa alertas para:
   - Deployment failed
   - Performance issues
   - Errors

---

## 🎯 Checklist Final

Antes de compartir tu casino, verifica:

- [ ] El sitio se abre correctamente
- [ ] Puedes conectar MetaMask
- [ ] Los 3 juegos funcionan
- [ ] Las transacciones se confirman
- [ ] Los premios se pagan correctamente
- [ ] El diseño se ve bien en móvil
- [ ] No hay errores en la consola

---

## 🚀 Próximos Pasos

1. **Personalizar:**
   - Cambia colores
   - Añade tu logo
   - Modifica textos

2. **Mejorar UX:**
   - Añade animaciones
   - Mejora mensajes de error
   - Añade sonidos

3. **Marketing:**
   - Comparte en redes sociales
   - Crea contenido
   - Construye comunidad

4. **Escalar:**
   - Añade más juegos
   - Implementa sistema de referidos
   - Crea programa de recompensas

---

## 🎉 ¡Felicidades!

¡Tu casino está PUBLICADO y funcionando en internet!

Ahora tienes:
- ✅ Un casino funcionando 24/7
- ✅ URL pública para compartir
- ✅ Deployment automático
- ✅ Hosting gratis
- ✅ SSL/HTTPS incluido

**Comparte tu casino con el mundo! 🌍**

---

## ❓ ¿Preguntas?

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Issues:** https://github.com/novacoinotc/CASCRYPTO/issues

---

**Recuerda:** Esto es testnet (red de pruebas). Para usar dinero real:
1. Implementa Chainlink VRF
2. Auditoría de seguridad
3. Consulta aspectos legales
4. Deploy en Polygon Mainnet

**¡Buena suerte! 🎰🚀**
