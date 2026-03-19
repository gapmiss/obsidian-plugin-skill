#!/bin/bash

# Obsidian Plugin Development Skill Installer
# Copies the skill to your project for Claude Code, Codex, and/or Windsurf

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_SOURCE="$SCRIPT_DIR/.agents/skills/obsidian"
COMMAND_SOURCE_DIR="$SCRIPT_DIR/.claude/commands"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Obsidian Plugin Development Skill Installer         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if skill source exists
if [ ! -d "$SKILL_SOURCE" ]; then
    echo -e "${RED}Error: Skill source not found at $SKILL_SOURCE${NC}"
    exit 1
fi

# Function to copy skill files to a target path
copy_skill() {
    local dest="$1"
    mkdir -p "$dest"
    cp -r "$SKILL_SOURCE"/* "$dest/"
    echo -e "${GREEN}✓ Skill files copied to $dest${NC}"
}

# Function to copy Claude Code commands
copy_commands() {
    local dest="$1/.claude/commands"
    mkdir -p "$dest"
    if [ -f "$COMMAND_SOURCE_DIR/obsidian.md" ]; then
        cp "$COMMAND_SOURCE_DIR/obsidian.md" "$dest/obsidian.md"
    fi
    if [ -f "$COMMAND_SOURCE_DIR/create-plugin.md" ]; then
        cp "$COMMAND_SOURCE_DIR/create-plugin.md" "$dest/create-plugin.md"
    fi
    echo -e "${GREEN}✓ Slash commands copied to $dest${NC}"
}

# Function to install skill
install_skill() {
    local target_dir="$1"
    local provider="$2"

    # Create target directory if it doesn't exist
    if [ ! -d "$target_dir" ]; then
        mkdir -p "$target_dir"
        echo -e "${GREEN}✓ Created directory: $target_dir${NC}"
    fi

    echo -e "${BLUE}Installing to: $target_dir${NC}"
    echo ""

    case $provider in
        all)
            echo -e "${YELLOW}Installing for all providers...${NC}"
            copy_skill "$target_dir/.agents/skills/obsidian"
            copy_skill "$target_dir/.claude/skills/obsidian"
            copy_commands "$target_dir"
            ;;
        claude)
            echo -e "${YELLOW}Installing for Claude Code...${NC}"
            copy_skill "$target_dir/.claude/skills/obsidian"
            copy_commands "$target_dir"
            ;;
        codex)
            echo -e "${YELLOW}Installing for Codex (OpenAI)...${NC}"
            copy_skill "$target_dir/.agents/skills/obsidian"
            ;;
        windsurf)
            echo -e "${YELLOW}Installing for Windsurf...${NC}"
            copy_skill "$target_dir/.agents/skills/obsidian"
            ;;
    esac

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              Installation Complete! ✓                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${YELLOW}Usage:${NC}"
    case $provider in
        all)
            echo -e "  Claude Code:  ${BLUE}/obsidian${NC}  or  ${BLUE}/create-plugin${NC}"
            echo -e "  Codex:        ${BLUE}\$obsidian${NC}"
            echo -e "  Windsurf:     ${BLUE}@obsidian${NC}"
            ;;
        claude)
            echo -e "  ${BLUE}/obsidian${NC}  or  ${BLUE}/create-plugin${NC}"
            ;;
        codex)
            echo -e "  ${BLUE}\$obsidian${NC}"
            ;;
        windsurf)
            echo -e "  ${BLUE}@obsidian${NC}"
            ;;
    esac
    echo ""

    return 0
}

# Provider selection
echo -e "${YELLOW}Which provider(s) are you using?${NC}"
echo ""
echo -e "  ${BLUE}1)${NC} All providers (recommended)"
echo -e "  ${BLUE}2)${NC} Claude Code"
echo -e "  ${BLUE}3)${NC} Codex (OpenAI)"
echo -e "  ${BLUE}4)${NC} Windsurf"
echo -e "  ${BLUE}5)${NC} Cancel"
echo ""
read -p "Enter choice [1-5]: " provider_choice

case $provider_choice in
    1) provider="all" ;;
    2) provider="claude" ;;
    3) provider="codex" ;;
    4) provider="windsurf" ;;
    5)
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

# Target directory selection
echo ""
echo -e "${YELLOW}Choose installation target:${NC}"
echo ""
echo -e "  ${BLUE}1)${NC} Install to current directory"
echo -e "  ${BLUE}2)${NC} Install to specific directory"
echo -e "  ${BLUE}3)${NC} Cancel"
echo ""
read -p "Enter choice [1-3]: " dir_choice

case $dir_choice in
    1)
        echo ""
        install_skill "$(pwd)" "$provider"
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
        install_skill "$target_path" "$provider"
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
