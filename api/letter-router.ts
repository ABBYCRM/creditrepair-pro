import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { disputeLetters, disputes, activities } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

function generateLetterContent(
  letterType: string,
  userName: string,
  userAddress: string,
  userCity: string,
  userState: string,
  userZip: string,
  userDob: string | null,
  userSsn: string | null,
  creditorName: string,
  creditorAddress: string,
  accountName: string,
  accountNumber: string,
  bureau: string,
  disputeReason: string,
  roundNumber: number
): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bureauAddress = {
    equifax: "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374-0256",
    experian: "Experian\nP.O. Box 4500\nAllen, TX 75013",
    transunion: "TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
  }[bureau] || `${creditorName}\n${creditorAddress}`;

  const bureauName = bureau.charAt(0).toUpperCase() + bureau.slice(1);

  const templates: Record<string, string> = {
    general: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${bureauAddress}

Re: Dispute of Inaccurate Credit Report Information

To Whom It May Concern:

I am writing to dispute the following information in my credit report. I have identified an error that requires your immediate investigation and correction.

Personal Information:
Name: ${userName}
${userDob ? `Date of Birth: ${userDob}` : ""}
${userSsn ? `SSN: XXX-XX-${userSsn}` : ""}

Disputed Item:
Creditor Name: ${accountName}
Account Number: ${accountNumber}
Bureau: ${bureauName}

Description of Error:
${disputeReason}

I am requesting that you investigate this matter and delete or correct the disputed item(s) as soon as possible. Under the Fair Credit Reporting Act (FCRA), you are required to complete your investigation within 30 days of receiving this dispute.

Please forward all evidence and documentation to me upon completion of your investigation. If you are unable to verify this information, it must be removed from my credit report in accordance with the FCRA.

I have enclosed copies of my identification for verification purposes. Please do not hesitate to contact me if you require additional information.

Thank you for your prompt attention to this matter.

Sincerely,

${userName}

Enclosures:
- Copy of Government-Issued ID
- Copy of Utility Bill
- Copy of Credit Report with disputed item circled`,

    section_609: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${bureauAddress}

Re: Request for Verification of Information Under FCRA Section 609

To Whom It May Concern:

I am writing to exercise my rights under Section 609 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681g. I am requesting that you provide me with the sources of the information reported on my credit file, as well as any and all evidence of my signature and contractual obligation for the following account(s):

Personal Information:
Name: ${userName}
${userDob ? `Date of Birth: ${userDob}` : ""}
${userSsn ? `SSN: XXX-XX-${userSsn}` : ""}

Account Requesting Verification:
Creditor: ${accountName}
Account Number: ${accountNumber}

Under Section 609 of the FCRA, I have the right to request:
1. All information in my consumer file
2. The sources of that information
3. The identity of each person who has accessed my file
4. The names and addresses of those who have requested my report for employment purposes in the past 2 years

I am specifically requesting that you provide:
- The original signed contract or agreement bearing my signature
- The original account application with my signature
- Any and all documents evidencing my consent to this account
- Complete payment history from the date of inception
- The method by which this account was allegedly verified in any prior dispute

If you are unable to provide the original signed documents or other verifiable proof that this account belongs to me, you are required by law to remove this information from my credit report.

Please note that this is my ${roundNumber}${
      roundNumber === 1 ? "st" : roundNumber === 2 ? "nd" : roundNumber === 3 ? "rd" : "th"
    } request for verification. I expect a complete and thorough response within 30 days as required by the FCRA.

Thank you for your attention to this matter.

Sincerely,

${userName}

Enclosures:
- Copy of Government-Issued ID
- Copy of Utility Bill`,

    section_611: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${bureauAddress}

Re: Method of Verification Request Under FCRA Section 611

To Whom It May Concern:

I recently disputed information on my credit report, and your company responded that the disputed item(s) have been "verified." I am now writing to request the method of verification used, pursuant to Section 611 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i.

Personal Information:
Name: ${userName}
${userDob ? `Date of Birth: ${userDob}` : ""}
${userSsn ? `SSN: XXX-XX-${userSsn}` : ""}

Previously Disputed Item:
Creditor: ${accountName}
Account Number: ${accountNumber}
Bureau: ${bureauName}

Under Section 611(a)(6) of the FCRA, you are required to provide me with:
1. A description of the procedures used to determine the accuracy and completeness of the information
2. The business name and address of the information furnisher
3. The telephone number of the furnisher, if reasonably available

Furthermore, I request the following:
- The specific documents or records reviewed to verify this information
- The name and title of the individual who verified the information
- The date the verification was completed
- A copy of any correspondence between your company and the furnisher

If you cannot provide the method of verification, or if the method used was not reasonable, you are required to remove this information from my credit report.

Please respond within 15 days of receiving this letter with the requested information.

Thank you.

Sincerely,

${userName}

Enclosures:
- Copy of Government-Issued ID
- Copy of Previous Dispute Response`,

    section_623: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${creditorName}
${creditorAddress}

Re: Direct Dispute Under FCRA Section 623 - Request for Investigation

To Whom It May Concern:

I am writing to dispute information that your company has furnished to the credit reporting agencies regarding my account. This letter is being sent directly to you as the data furnisher pursuant to Section 623 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681s-2.

Personal Information:
Name: ${userName}
${userDob ? `Date of Birth: ${userDob}` : ""}
${userSsn ? `SSN: XXX-XX-${userSsn}` : ""}

Disputed Account Information:
Account Name: ${accountName}
Account Number: ${accountNumber}

Description of Dispute:
${disputeReason}

Under Section 623 of the FCRA, you have a duty to:
1. Conduct a reasonable investigation of the dispute
2. Review all relevant information provided by me
3. Report the results of the investigation to the credit reporting agencies
4. Notify the credit reporting agencies if the information is found to be inaccurate

If you are unable to verify the accuracy of this information after a reasonable investigation, you are legally obligated to notify the credit reporting agencies to delete or correct this information.

Please conduct your investigation and respond within 30 days as required by law. Include all documentation and evidence supporting your findings.

Sincerely,

${userName}

Enclosures:
- Copy of Government-Issued ID
- Supporting Documentation`,

    debt_validation: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${creditorName}
${creditorAddress}

Re: Debt Validation Request Under FDCPA Section 809

To Whom It May Concern:

I am writing in response to your recent communication regarding an alleged debt. This letter is NOT a refusal to pay, but rather a notice that your claim is disputed and validation is requested pursuant to Section 809 of the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

Personal Information:
Name: ${userName}
${userDob ? `Date of Birth: ${userDob}` : ""}
${userSsn ? `SSN: XXX-XX-${userSsn}` : ""}

Alleged Debt Information:
Account: ${accountName}
Account Number: ${accountNumber}

Under the FDCPA, I request that you provide the following:
1. The name and address of the original creditor
2. The original account number
3. The date the account was opened and the date of first delinquency
4. A complete payment history from the original creditor
5. The original signed contract or agreement bearing my signature
6. Documents showing the amount and breakdown of the alleged debt
7. Proof that you own this debt or are authorized to collect it
8. Evidence that you are licensed to collect in my state

Until this debt is properly validated, please:
- Cease all collection activity
- Cease all reporting to credit bureaus
- Do not contact me except to provide the requested validation

Please note that any attempt to collect this debt without providing proper validation may constitute a violation of the FDCPA.

You have 30 days to provide the requested validation. Failure to do so will result in a formal complaint to the Consumer Financial Protection Bureau (CFPB) and my state Attorney General.

Sincerely,

${userName}`,

    goodwill: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${creditorName}
${creditorAddress}

Re: Goodwill Adjustment Request

To Whom It May Concern:

I am writing to request a goodwill adjustment to my credit report regarding the following account:

Account Information:
Account Name: ${accountName}
Account Number: ${accountNumber}

I am a loyal customer who has experienced ${disputeReason}. I take full responsibility for this oversight and have since taken steps to ensure timely payments going forward.

I am respectfully requesting that you consider removing the late payment notation from my credit report as a gesture of goodwill. I have been a customer in good standing for a significant period, and this isolated incident does not reflect my typical payment behavior.

A goodwill adjustment would greatly help me as I am working to improve my credit standing. I would sincerely appreciate your consideration of this request.

Thank you for your time and understanding.

Sincerely,

${userName}`,

    pay_for_delete: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${creditorName}
${creditorAddress}

Re: Pay-for-Delete Settlement Offer

To Whom It May Concern:

I am writing regarding the following account that appears on my credit report:

Account Information:
Account Name: ${accountName}
Account Number: ${accountNumber}
Balance: As reported

I am willing to settle this account in exchange for the complete deletion of this trade line from all three major credit reporting agencies (Equifax, Experian, and TransUnion).

This offer is made with the explicit understanding that:
1. Upon receipt of payment, you will delete this account from my credit report
2. The deletion will be reported to all three credit bureaus within 30 days
3. You will not sell or transfer the remaining balance to another collector
4. You will provide written confirmation of the deletion agreement

Please note that this is NOT an acknowledgment of the debt. I am making this offer to resolve this matter amicably.

If you agree to these terms, please sign and return a copy of this letter. I will then remit payment within 10 business days.

If you do not agree to delete the tradeline, this offer is void, and no payment will be made.

Sincerely,

${userName}

_________________________________
Accepted by: ____________________
Title: __________________________
Date: ___________________________
Company: _______________________`,

    cease_desist: `${userName}
${userAddress}
${userCity}, ${userState} ${userZip}

${today}

${creditorName}
${creditorAddress}

Re: Cease and Desist Notice Under FDCPA

To Whom It May Concern:

Please cease all communication with me regarding the following alleged debt:

Account: ${accountName}
Account Number: ${accountNumber}

Pursuant to Section 805(c) of the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692c, I hereby demand that you cease all further communication with me except to:

1. Advise me that your debt collection efforts are being terminated
2. Notify me of specific remedies you intend to invoke
3. Inform me that you or your firm intend to take a specific action

Any continued contact beyond these specific exceptions will constitute a violation of the FDCPA, subjecting you to statutory damages of up to $1,000 plus actual damages and attorney fees.

This notice applies to all forms of communication including phone calls, letters, emails, and text messages.

Be advised that I am keeping detailed records of all communications.

Sincerely,

${userName}

Sent via Certified Mail, Return Receipt Requested`,
  };

  return (
    templates[letterType] ||
    templates.general
  );
}

export const letterRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(disputeLetters)
      .where(eq(disputeLetters.userId, ctx.user.id))
      .orderBy(desc(disputeLetters.createdAt));
  }),

  listByDispute: authedQuery
    .input(z.object({ disputeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(disputeLetters)
        .where(
          and(
            eq(disputeLetters.disputeId, input.disputeId),
            eq(disputeLetters.userId, ctx.user.id)
          )
        );
    }),

  generate: authedQuery
    .input(
      z.object({
        disputeId: z.number(),
        letterType: z.enum([
          "general",
          "section_609",
          "section_611",
          "section_623",
          "debt_validation",
          "goodwill",
          "pay_for_delete",
          "cease_desist",
        ]),
        creditorName: z.string(),
        creditorAddress: z.string(),
        accountName: z.string(),
        accountNumber: z.string(),
        bureau: z.enum(["equifax", "experian", "transunion"]),
        disputeReason: z.string(),
        roundNumber: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [dispute] = await db
        .select()
        .from(disputes)
        .where(
          and(
            eq(disputes.id, input.disputeId),
            eq(disputes.userId, ctx.user.id)
          )
        );

      if (!dispute) {
        throw new Error("Dispute not found");
      }

      const user = ctx.user;
      const userName = user.name || "Consumer";

      const content = generateLetterContent(
        input.letterType,
        userName,
        user.address || "",
        user.city || "",
        user.state || "",
        user.zipCode || "",
        user.dateOfBirth
          ? new Date(user.dateOfBirth).toLocaleDateString("en-US")
          : null,
        user.ssnLastFour || null,
        input.creditorName,
        input.creditorAddress,
        input.accountName,
        input.accountNumber,
        input.bureau,
        input.disputeReason,
        input.roundNumber
      );

      const bureauName =
        input.bureau.charAt(0).toUpperCase() + input.bureau.slice(1);

      const [letter] = await db.insert(disputeLetters).values({
        disputeId: input.disputeId,
        userId: ctx.user.id,
        letterType: input.letterType,
        letterContent: content,
        recipientName: input.letterType === "section_623" ||
          input.letterType === "debt_validation" ||
          input.letterType === "goodwill" ||
          input.letterType === "pay_for_delete" ||
          input.letterType === "cease_desist"
          ? input.creditorName
          : bureauName,
        recipientAddress:
          input.letterType === "section_623" ||
          input.letterType === "debt_validation" ||
          input.letterType === "goodwill" ||
          input.letterType === "pay_for_delete" ||
          input.letterType === "cease_desist"
            ? input.creditorAddress
            : `${bureauName} Information Services\nP.O. Box 740256\nAtlanta, GA 30374`,
        subject: `Dispute of Inaccurate Information - ${input.accountName}`,
      });

      await db.insert(activities).values({
        userId: ctx.user.id,
        type: "letter_generated",
        title: "Dispute Letter Generated",
        description: `${input.letterType.toUpperCase()} letter generated for ${input.accountName}`,
        relatedId: Number(letter.insertId),
        relatedType: "letter",
      });

      return { id: Number(letter.insertId), content };
    }),

  markAsSent: authedQuery
    .input(
      z.object({
        id: z.number(),
        sentVia: z.enum(["certified_mail", "regular_mail", "fax", "email"]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(disputeLetters)
        .set({
          isSent: true,
          sentVia: input.sentVia,
          trackingNumber: input.trackingNumber,
        })
        .where(
          and(
            eq(disputeLetters.id, input.id),
            eq(disputeLetters.userId, ctx.user.id)
          )
        );

      await db.insert(activities).values({
        userId: ctx.user.id,
        type: "letter_sent",
        title: "Letter Sent",
        description: `Dispute letter sent via ${input.sentVia}`,
        relatedId: input.id,
        relatedType: "letter",
      });

      return { success: true };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [letter] = await db
        .select()
        .from(disputeLetters)
        .where(
          and(
            eq(disputeLetters.id, input.id),
            eq(disputeLetters.userId, ctx.user.id)
          )
        );
      return letter;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(disputeLetters)
        .where(
          and(
            eq(disputeLetters.id, input.id),
            eq(disputeLetters.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),
});
