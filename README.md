# authz

[![Build Status](https://travis-ci.org/konmuc/authz.png?branch=master)](https://travis-ci.org/konmuc/authz)
[![npm version](https://badge.fury.io/js/%40konmuc%2Fauthz.svg)](https://badge.fury.io/js/%40konmuc%2Fauthz.svg)
[![codecov.io](https://codecov.io/gh/konmuc/authz/branch/master/graphs/badge.svg?branch=master)](https://codecov.io/github/konmuc/authz?branch=master)

The authorization layer for the konmuc website.

> Warning: This is work in progress

@konmuc/authz has the following features:

- Provides an express middleware for authorize apis.
- Comes with a flexible RBAC (Role based access control) mechanismn.

# Installation

To use this package in an express application, execute the following command:

```
npm install @konmuc/authz --save
```

Before continuing it is recommended to install also the following express packages:

```
npm install express body-parser mongoose --save
```

# Usage

TODO

# Testing

The @konmuc/authz package use [`intern`](https://theintern.io/) as test runner.

To run the tests first run

```
npm install
```

Then execute in a bash

```
npm run test
```