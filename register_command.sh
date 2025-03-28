#!/bin/bash

# Load the .env file
if [ -f .env ]; then
  source .env
else
  echo ".env file not found!"
  exit 1
fi

# Ensure the required variables are set
if [[ -z "$DISCORD_TOKEN" || -z "$DISCORD_CLIENT_ID" ]]; then
  echo "DISCORD_TOKEN or DISCORD_CLIENT_ID is not set in the .env file!"
  exit 1
fi

# Define commands as an array of JSON strings
COMMANDS=(
  "{\"name\": \"help\", \"description\": \"You missed something, how do I report it? Oh oops, here's my boss's number 🙀\", \"type\": 1}"
  "{\"name\": \"about\", \"description\": \"What is A.U.R.A.? Who made it? Why? We've got all your answers here!\", \"type\": 1}"
)

# Register each command
for COMMAND_JSON in "${COMMANDS[@]}"; do
  RESPONSE=$(curl -s -X POST "https://discord.com/api/v10/applications/$DISCORD_CLIENT_ID/commands" \
    -H "Authorization: Bot $DISCORD_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$COMMAND_JSON")

  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "Command registered successfully!"
    echo "Response: $RESPONSE"
  else
    echo "Failed to register command: $COMMAND_JSON"
    echo "Response: $RESPONSE"
  fi
done

echo "All commands processed!"
