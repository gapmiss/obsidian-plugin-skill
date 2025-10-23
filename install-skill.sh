#!/bin/bash

# Obsidian Plugin Development Skill Installer
# Copies the skill to your project's .claude directory

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_SOURCE="$SCRIPT_DIR/.claude/skills/obsidian"
COMMAND_SOURCE="$SCRIPT_DIR/.claude/commands/obsidian.md"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Obsidian Plugin Development Skill Installer         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if skill source exists
if [ ! -d "$SKILL_SOURCE" ]; then
    echo -e "${RED}Error: Skill source not found at $SKILL_SOURCE${NC}"
    exit 1
fi

# Function to install skill
install_skill() {
    local target_dir="$1"

    # Validate target directory
    if [ ! -d "$target_dir" ]; then
        echo -e "${RED}Error: Directory '$target_dir' does not exist${NC}"
        return 1
    fi

    # Create .claude directories
    local skill_target="$target_dir/.claude/skills/obsidian"
    local command_target="$target_dir/.claude/commands"

    echo -e "${BLUE}Installing to: $target_dir${NC}"
    echo ""

    # Create directories
    mkdir -p "$skill_target"
    mkdir -p "$command_target"

    # Copy skill files
    echo -e "${YELLOW}Copying skill files...${NC}"
    cp -r "$SKILL_SOURCE"/* "$skill_target/"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Skill files copied successfully${NC}"
        echo -e "  Location: $skill_target"
    else
        echo -e "${RED}✗ Failed to copy skill files${NC}"
        return 1
    fi

    # Copy slash command
    if [ -f "$COMMAND_SOURCE" ]; then
        echo -e "${YELLOW}Copying slash command...${NC}"
        cp "$COMMAND_SOURCE" "$command_target/obsidian.md"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Slash command copied successfully${NC}"
            echo -e "  Location: $command_target/obsidian.md"
        else
            echo -e "${RED}✗ Failed to copy slash command${NC}"
            return 1
        fi
    fi

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              Installation Complete! ✓                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}The Obsidian plugin skill is now available in:${NC}"
    echo -e "  $target_dir"
    echo ""
    echo -e "${BLUE}Skill structure:${NC}"
    echo -e "  .claude/skills/obsidian/SKILL.md           (Main overview)"
    echo -e "  .claude/skills/obsidian/reference/         (Detailed docs)"
    echo -e "  .claude/commands/obsidian.md               (Slash command)"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  - Just ask Claude to help with Obsidian plugin development"
    echo -e "  - Or use: ${BLUE}/obsidian${NC} to explicitly load the skill"
    echo ""

    return 0
}

# Main installation flow
echo -e "${YELLOW}Choose installation option:${NC}"
echo ""
echo -e "  ${BLUE}1)${NC} Install to current directory"
echo -e "  ${BLUE}2)${NC} Install to specific directory"
echo -e "  ${BLUE}3)${NC} Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        install_skill "$(pwd)"
        ;;
    2)
        echo ""
        read -p "Enter target directory path: " target_path

        # Expand ~ to home directory
        target_path="${target_path/#\~/$HOME}"

        # Convert to absolute path
        if [[ "$target_path" != /* ]]; then
            target_path="$(pwd)/$target_path"
        fi

        echo ""
        install_skill "$target_path"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Installation cancelled${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
