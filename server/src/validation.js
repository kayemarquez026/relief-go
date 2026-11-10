
import { z } from 'zod';

export const nameRule = z.string().trim().min(2).max(100)
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u,
    'Use letters, spaces, apostrophes or hyphens only.'
  );

export const phoneRule = z.string().trim()
  .regex(
    /^09\d{9}$/,
    'Enter a valid mobile number.'
  );

export const lettersRule = z.string().trim().min(2).max(120)
  .regex(
    /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u,
    'Letters and spaces only (no numbers or symbols).'
  );

export const emailRule = z.string().trim().email().max(254)
  .transform(value => value.toLowerCase());

const validCents = value =>
  Math.abs(Math.round(value * 100) - value * 100) < 1e-7;

export const moneyRule = z.union([
  z.number(),
  z.string().trim().regex(
    /^\d+(?:\.\d{1,2})?$/,
    'Use digits with at most 2 decimal places.'
  )
])
  .transform(Number)
  .pipe(
    z.number()
      .finite()
      .positive()
      .max(10000000)
  )
  .refine(
    validCents,
    'Use at most 2 decimal places.'
  );

export const urlRule = z.string().trim().max(1000)
  .refine(value => {
    if (!value) return true;

    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Use a valid https:// address.');

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

const optionalDateRule = z.preprocess(
  value =>
    value === '' || value === null
      ? undefined
      : value,
  z.string()
    .refine(
      isRealDate,
      'Choose a valid YYYY-MM-DD date.'
    )
    .optional()
);

const optionalSlotsRule = z.preprocess(
  value =>
    value === '' || value === null
      ? undefined
      : value,
  z.union([
    z.number(),
    z.string().trim().regex(/^\d+$/)
  ])
    .transform(Number)
    .pipe(
      z.number()
        .int()
        .min(0)
        .max(10000)
    )
    .optional()
);

const registrationNameRule = z.string({
  required_error: 'Please enter your full name.',
  invalid_type_error: 'Please enter your full name.'
})
  .transform(value =>
    value.normalize('NFC').trim().replace(/\s+/g, ' ')
  )
  .pipe(
    z.string()
      .min(5, 'Please enter your complete full name.')
      .max(100, 'Full name must not exceed 100 characters.')
      .regex(
        /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)? [\p{L}]\. [\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u,
        'Invalid full name format. Use First Name, optional Second Name, Middle Initial, and Last Name (e.g., Maria A. Santos).'
      )
  );

const registrationEmailRule = z.string({
  required_error: 'Please enter your email address.',
  invalid_type_error: 'Please enter your email address.'
})
  .trim()
  .toLowerCase()
  .max(254, 'Email address must not exceed 254 characters.')
  .email('Please use a valid email address.')
  .refine(
    value =>
      /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/.test(value) &&
      !value.includes('..'),
    'Please use a valid email address.'
  );

const registrationPhoneRule = z.string({
  required_error: 'Please enter your mobile number.',
  invalid_type_error: 'Please enter your mobile number.'
})
  .trim()
  .regex(
    /^09\d{9}$/,
    'Please enter a valid 11-digit Philippine mobile number starting with 09.'
  );

export const registerRule = z.object({
  name: registrationNameRule,
  email: registrationEmailRule,
  phone: registrationPhoneRule,
  password: z.string({
    required_error: 'Please enter your password.',
    invalid_type_error: 'Please enter your password.'
  })
    .min(10, 'Password must be at least 10 characters.')
    .max(128, 'Password must not exceed 128 characters.'),
  role: z.enum(['donor', 'organizer'], {
    errorMap: () => ({
      message: 'Please choose Donor or Organizer.'
    })
  })
});

export const campaignRule = z.object({
  type: z.enum([
    'fundraiser',
    'volunteer_event'
  ]),

  title: lettersRule
    .min(8)
    .max(120),

  description: z.string()
    .trim()
    .min(40)
    .max(5000),

  category: z.string()
    .trim()
    .min(3)
    .max(40),

  city: z.string()
    .trim()
    .min(2)
    .max(100),

  beneficiary: z.string()
    .trim()
    .min(2)
    .max(120),

  beneficiaryRelation: z.string()
    .trim()
    .min(10)
    .max(200),

  contactPhone: phoneRule,
  startDate: optionalDateRule,
  deadline: optionalDateRule,

  latitude: z.number()
    .finite()
    .min(-90)
    .max(90)
    .nullable()
    .optional(),

  longitude: z.number()
    .finite()
    .min(-180)
    .max(180)
    .nullable()
    .optional(),

  goal: z.union([
    z.number(),
    z.string()
      .trim()
      .regex(/^\d+(?:\.\d{1,2})?$/)
  ])
    .transform(Number)
    .pipe(
      z.number()
        .finite()
        .min(0)
        .max(10000000)
    )
    .refine(
      validCents,
      'Use at most 2 decimal places.'
    )
    .default(0),

  budget: z.array(
    z.object({
      item: z.string()
        .trim()
        .min(3)
        .max(120),
      estimated: moneyRule
    })
  )
    .max(30)
    .default([]),

  payoutMethod: z.enum([
    'GCash',
    'Maya',
    'Bank Transfer'
  ]).optional(),

  payoutName: nameRule.optional(),

  payoutNumber: z.string()
    .regex(/^\d{8,25}$/)
    .optional(),

  needsVolunteers: z.boolean().optional(),

  volunteerHelpCategory: z.string()
    .trim()
    .max(70)
    .optional(),

  volunteerDuties: z.string()
    .trim()
    .max(3000)
    .optional(),

  volunteerRequirements: z.string()
    .trim()
    .max(3000)
    .optional(),

  volunteerLocation: z.string()
    .trim()
    .min(5)
    .max(200)
    .optional(),

  volunteerDate: z.string().optional(),
  volunteerSlots: optionalSlotsRule

}).superRefine((value, ctx) => {

  const issue = (path, message) => {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message
    });
  };

  if (value.type === 'fundraiser') {
    const today = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    if (value.startDate && value.startDate < today) {
      issue('startDate', 'Start date cannot be in the past.');
    }

    if (value.deadline && value.deadline < today) {
      issue('deadline', 'Deadline cannot be in the past.');
    }

    if (
      !value.startDate ||
      !value.deadline ||
      value.deadline <= value.startDate
    ) {
      issue(
        'deadline',
        'Choose an end date after the start date.'
      );
    }

    if (value.goal <= 0) {
      issue(
        'goal',
        'Goal must be greater than zero.'
      );
    }

    if (value.budget.length === 0) {
      issue(
        'budget',
        'Add at least one budget item.'
      );
    }

    if (
      !value.payoutMethod ||
      !value.payoutName ||
      !value.payoutNumber
    ) {
      issue(
        'payoutMethod',
        'Provide payout account details.'
      );
    }

    if (
      ['GCash', 'Maya'].includes(value.payoutMethod) &&
      !/^09\d{9}$/.test(value.payoutNumber || '')
    ) {
      issue(
        'payoutNumber',
        'GCash/Maya must have 11 digits starting with 09.'
      );
    }

    if (
      value.budget.length &&
      Math.abs(
        value.budget.reduce(
          (sum, item) => sum + item.estimated,
          0
        ) - value.goal
      ) > 0.01
    ) {
      issue(
        'budget',
        'Budget estimates must add up to the fundraising goal.'
      );
    }

    if (value.needsVolunteers) {
      if (!value.volunteerHelpCategory || value.volunteerHelpCategory.length < 2) {
        issue('volunteerHelpCategory', 'Choose the kind of volunteer help needed.');
      }

      if (!value.volunteerDuties || value.volunteerDuties.length < 10) {
        issue('volunteerDuties', 'Describe volunteer duties (at least 10 characters).');
      }

      if (!value.volunteerRequirements || value.volunteerRequirements.length < 10) {
        issue('volunteerRequirements', 'Describe volunteer requirements (at least 10 characters).');
      }

      if (!value.volunteerLocation || value.volunteerLocation.length < 5) {
        issue('volunteerLocation', 'Enter the volunteer meeting location.');
      }

      if (
        !value.volunteerDate ||
        !Number.isFinite(Date.parse(value.volunteerDate)) ||
        Date.parse(value.volunteerDate) <= Date.now()
      ) {
        issue('volunteerDate', 'Choose a future volunteer event date and time.');
      }

      if (!Number.isInteger(value.volunteerSlots) || value.volunteerSlots < 1) {
        issue('volunteerSlots', 'Enter at least one volunteer slot.');
      }
    }

    return;
  }

  if (
    !value.volunteerLocation ||
    value.volunteerLocation.length < 5
  ) {
    issue(
      'volunteerLocation',
      'Provide the event location.'
    );
  }

  if (
    !value.volunteerDate ||
    !Number.isFinite(Date.parse(value.volunteerDate)) ||
    Date.parse(value.volunteerDate) <= Date.now()
  ) {
    issue(
      'volunteerDate',
      'Choose a future event date and time.'
    );
  }

  const needsVolunteers =
    value.needsVolunteers ??
    (Number(value.volunteerSlots || 0) > 0);

  if (needsVolunteers) {
    if (
      !value.volunteerHelpCategory ||
      value.volunteerHelpCategory.length < 2
    ) {
      issue(
        'volunteerHelpCategory',
        'Choose the type of volunteer assistance needed.'
      );
    }

    if (
      !value.volunteerDuties ||
      value.volunteerDuties.length < 10
    ) {
      issue(
        'volunteerDuties',
        'Describe volunteer duties (at least 10 characters).'
      );
    }

    if (
      !value.volunteerRequirements ||
      value.volunteerRequirements.length < 10
    ) {
      issue(
        'volunteerRequirements',
        'Describe volunteer requirements (at least 10 characters).'
      );
    }

    if (
      !value.volunteerSlots ||
      value.volunteerSlots < 1
    ) {
      issue(
        'volunteerSlots',
        'Provide at least one volunteer slot.'
      );
    }

    if (
      value.latitude == null ||
      value.longitude == null
    ) {
      issue(
        'latitude',
        'Pin the exact event location on the map for GPS attendance.'
      );
    }
  }
});

export const donationRule = z.object({
  amount: moneyRule,

  method: z.enum([
    'GCash',
    'Maya',
    'Bank Transfer'
  ]),

  reference: z.string()
    .trim()
    .min(5)
    .max(80),

  senderName: nameRule,
  anonymous: z.boolean().default(false)
});

export const expenseRule = z.object({
  amount: moneyRule,

  description: z.string()
    .trim()
    .min(8)
    .max(1000),

  category: z.string()
    .trim()
    .min(3)
    .max(60),

  spentAt: z.string()
    .refine(
      value =>
        isRealDate(value) &&
        value <= new Date().toISOString().slice(0, 10),
      'Choose a real date no later than today.'
    ),

  publicSafe: z.literal(true)
});

export const volunteerRule = z.object({
  fullName: nameRule,
  phone: phoneRule,

  skills: z.string()
    .trim()
    .min(5)
    .max(1000),

  address: z.string()
    .trim()
    .min(5)
    .max(200),

  reason: z.string()
    .trim()
    .min(10)
    .max(1000),

  availability: z.string()
    .trim()
    .min(5)
    .max(500),

  note: z.string()
    .trim()
    .max(1000)
    .default(''),

  consent: z.literal(true)
});

export const updateRule = z.object({
  title: z.string()
    .trim()
    .min(3)
    .max(120),

  message: z.string()
    .trim()
    .min(5)
    .max(3000),

  imageUrl: urlRule.default('')
});

export function parseJsonOrString(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function validate(rule, data) {
  const result = rule.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues;

    const message = rule === registerRule
      ? (issues[0]?.message || 'Please check your registration details.')
      : issues.map(issue =>
          `${issue.path.join('.') || 'Field'}: ${issue.message}`
        ).join(' ');

    const error = new Error(message);
    error.status = 422;
    throw error;
  }

  return result.data;
}
