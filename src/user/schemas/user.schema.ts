import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  resetOtp: string;

  @Prop({ required: false })
  verificationOtp: string;

  @Prop({ required: true, default: false })
  isVerified: Boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
