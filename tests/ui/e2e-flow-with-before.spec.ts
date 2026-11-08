import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/en'
import { PASSWORD, USERNAME } from '../../config/env-data'
import {
  existingOrderMock,
  nonExistingOrderMock,
  orderCreationOrderMock,
  serveErrorOrderMock,
} from '../mock/order-mocks'

let loginPage: LoginPage

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  await loginPage.open()
})

test('signIn button disabled when incorrect data inserted', async ({}) => {
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(7))
  await expect(loginPage.signInButton).toBeDisabled()
})

test('error message displayed when incorrect credentials used', async ({}) => {
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(9))
  await loginPage.signInButton.click()

  await expect(loginPage.authError).toBeVisible()
})

test('login with correct credentials and verify order creation page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await expect(orderCreationPage.statusButton).toBeVisible()
  await expect(orderCreationPage.usernameInput).toBeVisible()
  await expect(orderCreationPage.phoneInput).toBeVisible()
  await expect(orderCreationPage.commentInput).toBeVisible()
  await expect(orderCreationPage.createOrderButton).toBeVisible()
})

test('login and create order', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.usernameInput.fill('random-user')
  await orderCreationPage.phoneInput.fill('56765434')
  await orderCreationPage.commentInput.fill('Testing')
  await orderCreationPage.createOrderButton.click()

  await expect(orderCreationPage.successmessage).toBeVisible()
})

test('check error on order creation', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.usernameInput.fill('r')
  await orderCreationPage.phoneInput.fill('55434')
  await orderCreationPage.commentInput.fill('Testing')

  //check
  await expect(orderCreationPage.createOrderButton).toBeDisabled()
  //error check
  await expect(orderCreationPage.customerNameError).toBeVisible()
  await expect(orderCreationPage.phoneError).toBeVisible()
})

test('log out from order page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)

  //log out
  await orderCreationPage.logoutButton.click()

  //check
  await expect(loginPage.signInButton).toBeVisible()
  await expect(orderCreationPage.logoutButton).toBeHidden()
})

test('order not found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)

  await nonExistingOrderMock(orderCreationPage.page)

  await orderCreationPage.statusButton.click()
  await orderCreationPage.searchOrderInput.fill('0')
  await orderCreationPage.searchOrderButton.click()

  //check
  await expect(orderCreationPage.orderNotFoundText).toBeVisible()
  await expect(orderCreationPage.orderNotFoundImage).toBeVisible()
})

test('order found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  //init mock before flow started
  await existingOrderMock(orderCreationPage.page)

  await orderCreationPage.statusButton.click()
  await orderCreationPage.searchOrderInput.fill('0')
  await orderCreationPage.searchOrderButton.click()

  //check
  await expect(orderCreationPage.orderStatusOpen).toBeVisible()
  await expect(orderCreationPage.orderNameDetails).toBeVisible()
})

test('order search -> error on server side', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  //init mock before flow started
  await serveErrorOrderMock(orderCreationPage.page)

  await orderCreationPage.statusButton.click()
  await orderCreationPage.searchOrderInput.fill('0')
  await orderCreationPage.searchOrderButton.click()

})

test('order creation -> mock', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationOrderMock(orderCreationPage.page)

  await orderCreationPage.usernameInput.fill('Mark')
  await orderCreationPage.phoneInput.fill('55667788')
  await orderCreationPage.commentInput.fill('keep near door')
  await orderCreationPage.createOrderButton.click()

  await expect(orderCreationPage.successmessage).toBeVisible()
})
