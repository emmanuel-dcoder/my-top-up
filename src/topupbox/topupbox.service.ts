// src/topupbox/topupbox.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TopupBoxService {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.token = process.env.TOPUPBOX_ACCESS_TOKEN;
    this.baseUrl = process.env.TOPUPBOX_BASE_URL;
    if (!this.token) {
      throw new Error(
        'TOPUPBOX_ACCESS_TOKEN is not set in environment variables',
      );
    }
    if (!this.baseUrl) {
      throw new Error('TOPUPBOX_BASE_URL is not set in environment variables');
    }
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDataPackages(network: string) {
    try {
      const url = `${this.baseUrl}/data-price-point/${network}`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers: this.getAuthHeaders() }),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message,
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllDataPackages() {
    try {
      const url = `${this.baseUrl}/data-price-point`; // ✅ adjust if docs say otherwise
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers: this.getAuthHeaders() }),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message,
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async recharge(
    network: string,
    rechargeType: 'AIRTIME' | 'DATA',
    payload: any,
  ) {
    try {
      const url = `${this.baseUrl}/recharge/${network}/${rechargeType}`;
      const { data } = await firstValueFrom(
        this.httpService.post(url, payload, { headers: this.getAuthHeaders() }),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message,
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactions(page: number, numPerPage: number) {
    try {
      const url = `${this.baseUrl}/query/page/${page}/${numPerPage}`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers: this.getAuthHeaders() }),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message,
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
