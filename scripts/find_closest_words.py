from annoy import AnnoyIndex
import array 


VECTORS_FILE  = "./data/glove-50d/preprocessed/vectors.bin" 
INDEXER_FILE  = "./data/glove-50d/preprocessed/indexer.ann" 
OUTPUT_FOLDER = "./data/glove-50d/preprocessed/" 
DIM_COUNT    = 50
TREE_COUNT   = 100

# --- utility functions 
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def encode_to_int_bytes(lst):
    items_b    = array.array("i", lst).tobytes() 
    return items_b


# --- load vectors file 
print("Loading vectors.")
vectors_ = open(VECTORS_FILE, "rb").read() 
vectors = array.array("f") 
vectors.frombytes(vectors_) 
vectors = vectors.tolist() 
vectors = list(chunks(vectors, DIM_COUNT))
print(f"\tShape: ({len(vectors)}, {len(vectors[0])})")

# --- load indexer 
print("Loading indexer.")
indexer = AnnoyIndex(DIM_COUNT, 'angular')
indexer.load(INDEXER_FILE)
print(f"---- Indexer: {indexer}")

# ---- find closest words 
print("Finding closest words.") 
closest = []
for i in range(len(vectors)): 
    print(f"---- Processing {i} of {len(vectors)}.")
    vector = vectors[i]
    results = indexer.get_nns_by_vector(vector, 10)
    j = 0 
    while results[j] == i:
        print("---- INCR")
        j += 1
    closest.append(results[j])

# --- saving to files 
print("Saving files.")

open(OUTPUT_FOLDER + "/closest.bin", "wb").write(encode_to_int_bytes(closest))

print("Done.")