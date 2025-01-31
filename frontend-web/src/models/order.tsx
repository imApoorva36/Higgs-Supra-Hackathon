export default class Order {
  customerName: string;
  id: number;
  customerWallet: string;
  deliveryAgentWallet: string;
  customerRfid: string;
  deliveryAgentRfid: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  orderDelivered: boolean;
  fundReleased: boolean;
  deliveryFees: number;
  content: string;
  description: string;

  public constructor(customerName: string, id: number, fundsReleased:boolean, customerWallet: string, deliveryAgentWallet: string, customerRfid: string, deliveryAgentRfid: string, orderDelivered: boolean, deliveryFees: number, content: string, description: string, deliveryAddress: string, deliveryLatitude: number, deliveryLongitude: number) {
    this.customerName = customerName;
    this.id = id;
    this.fundReleased = fundsReleased;
    this.customerWallet = customerWallet;
    this.deliveryAgentWallet = deliveryAgentWallet;
    this.customerRfid = customerRfid;
    this.deliveryAgentRfid = deliveryAgentRfid;
    this.orderDelivered = orderDelivered;
    this.deliveryFees = deliveryFees;
    this.content = content;
    this.description = description;
    this.deliveryAddress = deliveryAddress;
    this.deliveryLatitude = deliveryLatitude;
    this.deliveryLongitude = deliveryLongitude;
  }
}