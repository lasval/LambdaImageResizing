const AWS = require("aws-sdk");
const Sharp = require("sharp");
const secret = require("./secret.json");

AWS.config.update({
  accessKeyId: secret.S3_ACCESS_KEY_ID,
  secretAccessKey: secret.S3_SECRET_ACCESS_KEY_ID,
  region: "ap-northeast-2",
});
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const inputData = await s3.getObject(params).promise();

    const resizedImage_720 = await Sharp(inputData.Body)
      .resize(720, 405)
      .toBuffer();

    const resizedImage_480 = await Sharp(inputData.Body)
      .resize(480, 270)
      .toBuffer();

    const uploadParams_720 = {
      Bucket: bucket,
      Key: `resized_720/${key}`,
      Body: resizedImage_720,
    };
    const uploadParams_480 = {
      Bucket: bucket,
      Key: `resized_480/${key}`,
      Body: resizedImage_480,
    };
    await s3.upload(uploadParams_720).promise();
    await s3.upload(uploadParams_480).promise();

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Resized image was uploaded to ${
          (uploadParams_720.Key, uploadParams_480.key)
        }`,
      }),
    };
    callback(null, response);
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
