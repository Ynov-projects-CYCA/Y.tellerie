export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  public static create(amount: number, currency: string): Money {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!currency) {
      throw new Error('Currency is required');
    }
    return new Money(amount, currency.toLowerCase());
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }
}
