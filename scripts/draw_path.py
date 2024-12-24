import numpy as np
import matplotlib.pyplot as plt
from matplotlib import collections  as mc
import json
from PIL import Image
from PIL import ImageDraw
import random as rnd

for file in ["./data/wtl.json", "./data/wfm.json", "./data/wtm.json", "./data/manual.json"]:
    plt.clf()

    print("Load points.")
    data = json.load(open(file, "r"))

    print("Extract points and path.") 
    locations = np.array(data["locations"])
    path = data["fullPath"]

    print("Display scatter plot.")

    plt.title("path: " + "-".join(path))
    plt.scatter(locations[:,0], locations[:,1])
    plt.scatter(locations[0,0], locations[0,1], color="green")
    plt.scatter(locations[-1,0], locations[-1,1], color="red")

    print("Connect the path.")
    plt.plot(locations[:,0], locations[:,1], label=file)
    
    plt.savefig(file + ".png")