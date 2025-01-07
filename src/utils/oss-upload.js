// import OSS from 'ali-oss'

export async function uploadFileToOSS(file, policy) {
  // const { AccessKeyId, AccessKeySecret, SecurityToken, Expiration } = policy
  // const client = new OSS({
  //   region: 'oss-cn-shanghai', // 你的OSS区域
  //   accessKeyId: AccessKeyId,
  //   accessKeySecret: AccessKeySecret,
  //   stsToken: SecurityToken,
  //   bucket: 'your-bucket-name' // 你的OSS桶名称
  // })

  const fileName = `${Date.now()}_${file.name}` // 上传到OSS的文件名
  try {
    // const result = await client.put(fileName, file) // 上传文件
    // mock 返回
    const result = {
      url: 'https://test/' + fileName
    }
    return result.url // 返回文件的URL
  } catch (err) {
    console.error('OSS上传失败：', err)
    throw new Error('上传文件到OSS失败')
  }
}
