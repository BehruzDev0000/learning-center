import { HttpException } from "@nestjs/common"

export const handleError=(error:any)=>{
    const message = error.response?.message||error.message
    const status=error.response?.statusCode||500
    throw new HttpException(message,status)
}