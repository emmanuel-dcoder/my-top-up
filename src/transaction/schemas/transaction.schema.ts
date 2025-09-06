import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({
    default: 'pending',
    enum: ['pending', 'confirmed', 'failed', 'reversed', 'paid'],
  })
  status: 'pending' | 'confirmed' | 'failed' | 'paid' | 'reversed';

  @Prop({ required: true })
  channel: string;

  @Prop({ required: true })
  beneficiary: string;

  @Prop({ required: true })
  customerReference: string;

  @Prop({ required: true })
  network: string;

  @Prop({ required: false })
  transactionId: string;

  @Prop({ required: true })
  paymentFor: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
