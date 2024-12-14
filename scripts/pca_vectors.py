from annoy import AnnoyIndex
import array 
from itertools import chain
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

VECTORS_FILE = "./data/glove-50d/preprocessed/vectors.bin" 
OUTPUT_FILE  = "./data/glove-50d/preprocessed/vectors.pca2d.bin" 
DIM_COUNT    = 50
TREE_COUNT   = 100
RANDOM_STATE = 1234567890

# --- utility functions 
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def flatten(lst):
    return list(chain.from_iterable(lst))

def encode_to_float_bytes(lst):
    items_b    = array.array("f", lst).tobytes() 
    return items_b

# --- load vectors file 
print("Loading vectors.")
vectors_ = open(VECTORS_FILE, "rb").read() 
vectors = array.array("f") 
vectors.frombytes(vectors_) 
vectors = vectors.tolist() 
vectors = list(chunks(vectors, DIM_COUNT))
vectors = np.array(vectors)
print(f"\tShape: {vectors.shape}")

# --- apply pca
print("Applying PCA.")
pca = PCA(n_components=2, random_state=RANDOM_STATE)
vectors = pca.fit_transform(vectors)

# --- saving to file 
print("Saving to file.")
vectors = flatten(vectors)
open(OUTPUT_FILE, "wb").write(encode_to_float_bytes(vectors))

print("Done.")