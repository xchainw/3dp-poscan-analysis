// Import the API
const {ApiPromise, WsProvider} = require('@polkadot/api');
async function main() {
    const rpcUrl = "wss://rpc.3dpscan.io";
    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({provider});

    try {
        const objCount = Number(await api.query.poScan.objCount());
        console.log('Total Records:', objCount);

        // Use Map to store account_id and its occurrence count
        const outlierCounts = new Map();

        if (objCount && objCount > 0) {
            for (let i = 0; i < objCount; i++) {
                console.log('Processing index:', i);
                const poScanInfo = (await api.query.poScan.objects(i)).toJSON();

                //Count the number of times each account_id appears
                poScanInfo.estOutliers.forEach(accountId => {
                    const currentCount = outlierCounts.get(accountId) || 0;
                    outlierCounts.set(accountId, currentCount + 1);
                });
            }
        }

        // Convert the results to an array and sort them in descending order of occurrence
        const sortedOutliers = Array.from(outlierCounts.entries())
            .sort((a, b) => b[1] - a[1]);

        // Print statistics
        console.log('\nOutlier Evaluator Statistics:');
        console.log('Total number of outlier evaluators:', outlierCounts.size);
        console.log('\nDetailed Statistics:');
        sortedOutliers.forEach(([accountId, count]) => {
            console.log(`${accountId} appeared ${count} times (${((count/objCount)*100).toFixed(2)}%)`);
        });

    } catch (error) {
        console.error('Main program error:', error);
    } finally {
        await provider.disconnect();
    }
}


main().catch(console.error);