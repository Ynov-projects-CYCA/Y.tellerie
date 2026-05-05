export class PriceVO {
  private constructor(
    private readonly amount: number,
    private readonly currency: string = 'EUR',
  ) {
    if (amount < 0) {
      throw new Error('Le prix ne peut pas etre negatif');
    }
    if (amount > 1000000) {
      throw new Error('Le prix est trop eleve');
    }
  }

  static create(amount: number, currency: string = 'EUR'): PriceVO {
    return new PriceVO(amount, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  equals(other: PriceVO): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
