const delays = [3000,2000,1000];

const slowResolver = async (d) => new Promise((resolve, _reject) => {
    setTimeout(resolve, d);
});

for (const delay of delays) {
    console.log(`Starting delay of ${delay}ms`);
    await slowResolver(delay);
    console.log(`Finished delay of ${delay}ms`);
}
