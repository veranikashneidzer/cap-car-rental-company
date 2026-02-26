
using { cuid } from '@sap/cds/common';
namespace sap.carRentalCompany;

entity Cars {
  key licensePlate  : String;
  brand  : localized String;
  model : localized String;
  manufactureDate : Date;
  price : Decimal;
  availability : Integer;
  category : localized String;
  rentals : Association to many Rentals on rentals.car = $self;
  customer : Association to many Rentals on customer.car = $self;
}

@assert.unique: { email: [email] }
entity Customers {
  key driverLicenseNumber : String;
  firstName : String;
  lastName : String;
  email : String(100) @mandatory;
  phone : String;
  address : String;
  rentals : Association to many Rentals on rentals.customer = $self;
}

entity Rentals : cuid {
  rentalDate : Date;
  returnDate : Date;
  customer : Association to Customers;
  car : Association to Cars;
  price : Decimal;
}

entity Maintenance : cuid {
  car : Association to Cars;
  startDate : Date;
  endDate : Date;
  issue : String;
  cost : Decimal;
}