import { BigQuery } from "@google-cloud/bigquery";
import bizSdk from "facebook-nodejs-business-sdk";

// Configuration

const googleCloudProjectId = "facebook-testing-project"; //Update as needed
const bigquery = new BigQuery({ projectId: googleCloudProjectId });
const datasetId = "facebook"; //Update as needed
const tableId = "test-table"; //Update as needed

//Facebook configuration
const accessToken = "YOUR_ACCESS_TOKEN";
const facebookAccountId = "YOUR_ACCOUNT_ID";
const options = {
  date_preset: "this_month",
  time_increment: 1,
};



let data = await getAccountStats(facebookAccountId);
//console.log(data);
insertRowsAsStream(datasetId, tableId, data);

// Don't change this code

async function getAccountStats(facebookAccountId) {
  const accountId = `act_${facebookAccountId}`;
  let arr = new Array();

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
  const AdAccount = bizSdk.AdAccount;
  const account = new AdAccount(accountId);

  let apiData = await account.getInsights(
    ["impressions", "inline_link_clicks", "spend"],
    options
  );
  apiData.forEach((r) => arr.push(r._data));
  while (apiData.hasNext()) {
    apiData = await apiData.next();
    apiData.forEach((r) => {
      arr.push(r._data);
    });
  }

  return arr;
}

async function insertRowsAsStream(datasetId, tableId, rows) {
  await bigquery.dataset(datasetId).table(tableId).insert(rows);
  console.log(`Inserted ${rows.length} rows`);
}
