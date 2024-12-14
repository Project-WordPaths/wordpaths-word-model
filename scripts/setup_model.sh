node scripts/prepare-model.js 
python3 -m scripts.build_indexer
python3 -m scripts.find_closest_words
python3 -m scripts.pca_vectors
echo "--- DONE. ---"
