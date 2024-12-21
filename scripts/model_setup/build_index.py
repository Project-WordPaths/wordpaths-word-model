from annoy import AnnoyIndex
import array 

VECTORS_FILE = "./data/glove-50d/preprocessed/vectors.bin" 
INDEX_FILE = "./data/glove-50d/preprocessed/index.ann" 
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

# --- create index 
print("Preparing index.")
index = AnnoyIndex(DIM_COUNT, 'angular')

# --- add items 
print("Adding items to index.")
for i in range(len(vectors)):
    print(f"---- Adding item {i} of {len(vectors)}.", end="\r")
    vector = vectors[i]
    index.add_item(i, vector) 
print()

# --- build trees
print("Building index.")
index.verbose(10)
index.build(TREE_COUNT)

# --- save index
print("Saving index.")
index.save(INDEX_FILE)

print("Done.")