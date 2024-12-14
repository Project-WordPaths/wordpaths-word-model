from annoy import AnnoyIndex
import array 

VECTORS_FILE = "./data/glove-50d/preprocessed/vectors.bin" 
INDEXER_FILE = "./data/glove-50d/preprocessed/indexer.ann" 
DIM_COUNT    = 50
TREE_COUNT   = 100

# --- utility functions 
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

# --- load vectors file 
print("Loading vectors.")
vectors_ = open(VECTORS_FILE, "rb").read() 
vectors = array.array("f") 
vectors.frombytes(vectors_) 
vectors = vectors.tolist() 
vectors = list(chunks(vectors, DIM_COUNT))
print(f"\tShape: ({len(vectors)}, {len(vectors[0])})")

# --- create indexer 
print("Preparing indexer.")
indexer = AnnoyIndex(DIM_COUNT, 'angular')

# --- add items 
print("Adding items to indexer.")
for i in range(len(vectors)):
    print(f"---- Adding item {i} of {len(vectors)}.", end="\r")
    vector = vectors[i]
    indexer.add_item(i, vector) 
print()

# --- build trees
print("Building indexer.")
indexer.verbose(10)
indexer.build(TREE_COUNT)

# --- save indexer
print("Saving indexer.")
indexer.save(INDEXER_FILE)

print("Done.")