import * as jwt from "jsonwebtoken";

export interface IJwtPayloadWithId extends jwt.JwtPayload {
  id: number;
}