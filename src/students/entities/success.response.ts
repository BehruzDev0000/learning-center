export const successResponse=(data:object,statusCode=200)=>{
    return {
    statusCode,
    message:'success',
    data
    }
}