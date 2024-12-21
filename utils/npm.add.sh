#
# npm.add.sh
# -----
# Adds a package via npm and links the project folder 
# in node_modules/ folder. 
# 

# -- install packages 
echo "--- INSTALLING PACKAGES"
npm add $@ 

# --- link project folder
echo "--- LINKING PROJECT FOLDER"
ln -s ../ node_modules/wordpaths-word-model

# --- link wordpaths-common
echo "--- LINKING wordpaths-common/ FOLDER"
ln -s ../../wordpaths-common node_modules/wordpaths-common

# --- link wordpaths-ivfflat
echo "--- LINKING wordpaths-ivfflat/ FOLDER"
ln -s ../../wordpaths-ivfflat node_modules/wordpaths-ivfflat

# --- mark as done 
echo "--- DONE"


