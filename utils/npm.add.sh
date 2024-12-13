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
npm link . 

# --- mark as done 
echo "--- DONE"


