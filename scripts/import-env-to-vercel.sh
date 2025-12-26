#!/bin/bash

# Script to securely import environment variables from .env to Vercel
# This script reads the .env file and imports each variable to Vercel
# for Production, Preview, and Development environments

set -e  # Exit on error

ENV_FILE=".env"
ENVIRONMENTS=("production" "preview" "development")

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE file not found!"
    exit 1
fi

echo "🔐 Starting secure environment variable import to Vercel..."
echo ""

# Read .env file and process each line
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Extract variable name (everything before the first =)
    if [[ "$line" =~ ^([^=]+)= ]]; then
        VAR_NAME="${BASH_REMATCH[1]}"
        
        echo "📤 Importing: $VAR_NAME"
        
        # Import to each environment
        for env in "${ENVIRONMENTS[@]}"; do
            echo "  → Adding to $env..."
            # Use --force to overwrite if exists, pipe the line to vercel env add
            echo "$line" | sed "s/^$VAR_NAME=//" | vercel env add "$VAR_NAME" "$env" --force --sensitive > /dev/null 2>&1 || {
                echo "  ⚠️  Warning: Failed to add $VAR_NAME to $env (may already exist)"
            }
        done
        
        echo "  ✅ Done"
        echo ""
    fi
done < "$ENV_FILE"

echo "✨ Environment variable import completed!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel env ls' to verify variables"
echo "2. Run 'vercel --prod' to deploy with new environment variables"
