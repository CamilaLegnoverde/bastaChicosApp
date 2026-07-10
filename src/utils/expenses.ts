/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Expense, Friend, UserProfile, MemberBalance, Transfer, Settlement } from '../types';

/**
 * Calculates the balance sheet for all members in a hangout.
 * Los settlements (transferencias ya realizadas) ajustan el balance final:
 * quien pagó reduce su deuda y quien recibió reduce su crédito.
 */
export function calculateBalances(
  memberIds: string[],
  expenses: Expense[],
  friendsList: Friend[],
  currentUser: UserProfile,
  settlements: Settlement[] = []
): MemberBalance[] {
  const memberBalancesMap: Record<string, { totalPaid: number; totalOwed: number }> = {};

  // Initialize map
  memberIds.forEach((id) => {
    memberBalancesMap[id] = { totalPaid: 0, totalOwed: 0 };
  });

  // Accumulate paid and owed amounts
  expenses.forEach((expense) => {
    const payerId = expense.paidBy;
    const splitCount = expense.splitAmong.length;
    const amount = expense.amount;

    if (splitCount > 0) {
      const share = amount / splitCount;

      // Add paid amount to payer (if they are in the hangout)
      if (memberBalancesMap[payerId]) {
        memberBalancesMap[payerId].totalPaid += amount;
      }

      // Add owed amount to each split partner
      expense.splitAmong.forEach((partnerId) => {
        if (memberBalancesMap[partnerId]) {
          memberBalancesMap[partnerId].totalOwed += share;
        }
      });
    }
  });

  // Build final balance array
  return memberIds.map((id) => {
    let name = 'Integrante';
    let avatarColor = 'bg-gray-400';
    let avatarUrl: string | undefined;
    let aliasMP = '';

    if (id === currentUser.id) {
      name = `${currentUser.name} (Vos)`;
      avatarColor = currentUser.avatarColor;
      avatarUrl = currentUser.avatarUrl;
      aliasMP = currentUser.aliasMP;
    } else {
      const friend = friendsList.find((f) => f.id === id);
      if (friend) {
        name = friend.name;
        avatarColor = friend.avatarColor;
        avatarUrl = friend.avatarUrl;
        aliasMP = friend.aliasMP;
      }
    }

    const totals = memberBalancesMap[id] || { totalPaid: 0, totalOwed: 0 };

    // Ajuste por transferencias ya realizadas
    let settled = 0;
    settlements.forEach((s) => {
      if (s.fromId === id) settled += s.amount; // pagó su deuda
      if (s.toId === id) settled -= s.amount; // cobró su crédito
    });

    const balance = totals.totalPaid - totals.totalOwed + settled;

    return {
      id,
      name,
      avatarColor,
      avatarUrl,
      aliasMP,
      totalPaid: Math.round(totals.totalPaid * 100) / 100,
      totalOwed: Math.round(totals.totalOwed * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  });
}

/**
 * Generates the minimal list of transfers required to settle all debts.
 */
export function calculateTransfers(balances: MemberBalance[]): Transfer[] {
  // Deep copy so we don't mutate original balances
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ id: b.id, amount: Math.abs(b.balance) }))
    .sort((a, b) => b.amount - a.amount); // Sort descending to match largest debtor

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ id: b.id, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount); // Sort descending to match largest creditor

  const transfers: Transfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amountToTransfer = Math.min(debtor.amount, creditor.amount);

    if (amountToTransfer > 0.01) {
      transfers.push({
        fromId: debtor.id,
        toId: creditor.id,
        amount: Math.round(amountToTransfer * 100) / 100,
      });
    }

    debtor.amount -= amountToTransfer;
    creditor.amount -= amountToTransfer;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return transfers;
}
