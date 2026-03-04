
using { cuid } from '@sap/cds/common';
namespace sap.carRentalCompany;

entity Cars {
  key licensePlate  : String            @mandatory;
  brand             : localized String  @mandatory;
  model             : localized String  @mandatory;
  manufactureDate   : Date              @mandatory;
  price             : Decimal           @mandatory;
  category          : Association to CarCategories;
  rentals           : Association to many Rentals on rentals.car = $self;
  maintenance       : Composition of many Maintenance on maintenance.car = $self;
}

entity CarStatuses {
  key code : String;
  label : String;
  criticality: Integer
}

entity CarCategories {
  key code : String;
  name : String;
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
