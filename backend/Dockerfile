FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the backend source
COPY . .

# Make sure the SQLite data directory exists (also created at runtime by db.js)
RUN mkdir -p /app/data

ENV PORT=4000
EXPOSE 4000

# Seed the database only if it doesn't already exist yet (e.g. fresh volume),
# then start the API. Re-seeding never happens on restarts, so real data
# created via the API is never wiped.
CMD ["sh", "-c", "if [ ! -f /app/data/waypoint.db ]; then node seed.js; fi; node server.js"]
