import pkg from '../lib/adminMetrics.js';

const { getUsersData } = pkg;

const main = async () => {
  try {
    const result = await getUsersData({ page: 1, pageSize: 20 });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error running getUsersData:', error);
  }
};

main();
