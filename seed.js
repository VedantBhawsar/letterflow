// seed.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'; // For generating random strings
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- CONFIGURATION ---
const TARGET_USERS = 2000;
const MIN_SUBSCRIBERS_PER_USER = 10000;
const SUBSCRIBER_BATCH_SIZE = 5000; // Adjust based on performance/memory
const SAMPLE_SUBSCRIBER_LINK_COUNT = 1000; // How many subscribers to link to campaigns/segments

// --- Security Warning ---
console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.warn("!!! SECURITY WARNING: Using plain text password 'Password123' for seeding.");
console.warn("!!! NEVER use plain text passwords in production. Always use secure hashing.");
console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log("\n");
console.warn("***********************************************************");
console.warn("*** PERFORMANCE WARNING: This script will generate >20 MILLION records");
console.warn("*** and will take a VERY LONG TIME to complete.");
console.warn("*** Ensure your database and machine can handle the load.");
console.warn("***********************************************************\n");


// --- Indian-Themed Data Arrays (Expand if needed) ---
const indianFirstNames = [ /* (Keep your large list) */ 'Aarav', 'Vihaan', 'Vivaan', 'Aditya', 'Advik', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Ananya', 'Saanvi', 'Aadhya', 'Myra', 'Diya', 'Pari', 'Kiara', 'Anika', 'Tara', 'Riya', 'Rohan', 'Priya', 'Amit', 'Deepika', 'Vikram', 'Sunita', 'Rajesh', 'Pooja', 'Sanjay', 'Neha', 'Kabir', 'Zara', 'Aryan', 'Ishita', 'Mohan', 'Geeta', 'Siddharth', 'Meera', 'Rahul', 'Simran', 'Dev', 'Aisha', 'Karan', 'Nisha', 'Arnav', 'Rani', 'Ravi', 'Seema', 'Vijay', 'Anjali'];
const indianLastNames = [ /* (Keep your large list) */ 'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Reddy', 'Naidu', 'Rao', 'Iyer', 'Menon', 'Nair', 'Khan', 'Malhotra', 'Chopra', 'Kapoor', 'Agarwal', 'Banerjee', 'Mukherjee', 'Das', 'Pillai', 'Choudhury', 'Bhatia', 'Jain', 'Saxena', 'Mishra', 'Trivedi', 'Yadav', 'Pandey', 'Desai', 'Fernandes', 'Goel', 'Mahajan'];
const indianCities = [ /* (Keep your large list) */ 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai'];
const emailDomains = ['gmail.com', 'yahoo.co.in', 'outlook.com', 'rediffmail.com', 'hotmail.com', 'company.in', 'serviceprovider.net', 'edu.in', 'gov.in', 'org.in'];
const campaignSubjects = [ /* (Keep your large list) */ '🎉 Diwali Special Offers Inside!', 'Holi Hai! Celebrate with Colors & Discounts', 'Exclusive Independence Day Sale', 'Monsoon Bonanza: Deals to Brighten Your Day', 'Cricket Fever: Catch the Match Day Deals', 'Bollywood Buzz: Latest Updates & Offers', 'Ganesh Chaturthi Blessings & Savings', 'New Year, New Beginnings: Fresh Deals for You', 'Republic Day Parade Specials', 'Taste of India: Culinary Delights Newsletter', 'Summer Vacation Packages!', 'Tech Gadget Launch - Pre-book Now!', 'Financial Planning Tips for Indians', 'Upgrade Your Skills: New Courses Added', 'Exclusive Webinar Invitation', 'Your Weekly Real Estate Update'];
const campaignStatuses = ['draft', 'scheduled', 'sent', 'archived'];
const subscriberStatuses = ['active', 'unsubscribed', 'bounced', 'complained'];
const subscriberSources = ['Website Signup', 'Imported List', 'Social Media Lead', 'Event Registration', ...indianCities.slice(0, 15), 'Referral Program', 'API', 'Manual Add', 'Partner Opt-in'];
const templateCategories = ['Newsletter', 'Promotion', 'Announcement', 'Transactional', 'Festive Offer', 'Welcome Email', 'Re-engagement', 'Blog Update', 'Event Invitation', 'System Alert'];
const newsletterStatuses = ['draft', 'published'];
const formStatuses = ['active', 'inactive', 'archived'];
const segmentNames = [ /* (Keep your large list) */ 'High Engagement Users - Mumbai', 'New Subscribers - Past 7 Days', 'Potential Leads - IT Sector', 'Festive Shoppers (Diwali)', 'Inactive Subscribers (90+ days)', 'Pune Tech Professionals', 'Cricket Enthusiasts (IPL)', 'Bollywood Movie Buffs', 'Subscribers interested in Travel (Goa)', 'Users who opened Welcome Email', 'IT Professionals Bangalore', 'Students in Delhi NCR', 'Recent Website Visitors (Blog)', 'Customers with > 3 Purchases', 'High Value Leads', 'Unengaged List Segment'];
const commonTags = [ /* (Keep your large list) */ 'Diwali Sale', 'Holi Offer', 'Cricket Fans', 'Bollywood News', 'Tech Updates', 'Travel Deals', 'Mumbai Customers', 'Delhi Leads', 'High Engagement', 'New Subscriber', 'Newsletter Recipient', 'VIP Customer', 'Lead', 'Engaged', 'Student', 'Professional', 'B2B', 'B2C', 'Blog Subscriber', 'Webinar Attendee', 'Prospect', 'Customer', 'Premium', 'Active User'];


// --- Helper Functions ---
function getRandomElement(arr) { if (arr.length === 0) throw new Error("Cannot get random element from empty array"); return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomSubset(arr, minCount = 1, maxCount) { const max = maxCount ?? arr.length; const count = Math.floor(Math.random() * (max - minCount + 1)) + minCount; const actualCount = Math.min(count, arr.length, max); if (actualCount <= 0 || arr.length === 0) return []; const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, actualCount); }
function generateRandomString(length = 16) { return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length); }
function getRandomInt(min, max) { min = Math.ceil(min); max = Math.floor(max); return Math.floor(Math.random() * (max - min + 1)) + min; }

// More robust email generation for high volume
function generateSubscriberEmail(firstName, lastName, userIndex, subIndex) {
  const randomNum = Math.floor(Math.random() * 100);
  // Basic cleaning and combining parts for uniqueness
  const firstPart = firstName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5);
  const lastPart = lastName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5);
  return `${firstPart}${lastPart}_u${userIndex}_s${subIndex}_${randomNum}@${getRandomElement(emailDomains)}`;
}

function generateUserEmail(firstName, lastName, userIndex) {
  const randomNum = Math.floor(Math.random() * 100);
  const firstPart = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const lastPart = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${firstPart}.${lastPart}${userIndex}${randomNum}@${getRandomElement(emailDomains)}`;
}


function createJsonFieldExample() { return { theme: getRandomElement(['light', 'dark', 'corporate', 'festive', 'minimal']), fontSize: getRandomElement([12, 14, 16]), fontFamily: getRandomElement(['Arial', 'Verdana', 'Times New Roman', 'Roboto', 'Lato']), customSetting: `value_${generateRandomString(4)}` }; }
function createFormFieldsExample() { return [{ name: 'email', type: 'email', label: 'Email Address*', required: true, placeholder: 'you@example.com' }, { name: 'firstName', type: 'text', label: 'First Name', required: Math.random() > 0.5, placeholder: 'Your First Name' }, { name: 'mobile', type: 'tel', label: 'Mobile (Optional)', required: false }, { name: 'city', type: 'select', label: 'Nearest City', options: getRandomSubset(indianCities, 5, 10), required: false }, { name: 'consent', type: 'checkbox', label: 'I agree to receive marketing emails', required: true, defaultChecked: true }]; }
function createSegmentRulesExample(userCity) { /* (Keep the existing logic) */ const possibleFields = ['tags', 'source', 'engagementScore', 'subscribedAt', 'status', 'customFields.city']; const field = getRandomElement(possibleFields); let rule; switch (field) { case 'customFields.city': rule = { field: 'customFields.city', operator: 'equals', value: userCity ?? getRandomElement(indianCities) }; break; case 'tags': rule = { field: 'tags', operator: 'contains', value: getRandomElement(commonTags) }; break; case 'source': rule = { field: 'source', operator: 'equals', value: getRandomElement(subscriberSources) }; break; case 'engagementScore': rule = { field: 'engagementScore', operator: getRandomElement(['greater_than_or_equal', 'less_than']), value: parseFloat((Math.random() * 5).toFixed(1)) }; break; case 'subscribedAt': const daysAgo = getRandomElement([7, 30, 90, 180, 365]); const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(); rule = { field: 'subscribedAt', operator: getRandomElement(['after', 'before']), value: date }; break; default: rule = { field: 'status', operator: 'equals', value: 'active' }; } if (Math.random() > 0.7) { const secondField = getRandomElement(['tags', 'status', 'source']); let secondRule; if (secondField === 'tags') { secondRule = { field: 'tags', operator: 'does_not_contain', value: getRandomElement(commonTags) }; } else if (secondField === 'status') { secondRule = { field: 'status', operator: 'equals', value: 'active' }; } else { secondRule = { field: 'source', operator: 'not_equals', value: 'Imported List' }; } return [rule, secondRule]; } return [rule]; }
function createNewsletterElements() { /* (Keep the existing logic) */ return [{ type: 'header', content: `Update from ${getRandomElement(indianCities)}: ${getRandomElement(['Tech', 'Culture', 'Events'])}` }, { type: 'text', content: `Namaste! Your weekly digest is here. ${generateRandomString(60)}...` }, { type: 'image', src: `https://via.placeholder.com/600x200.png?text=India+Update+${generateRandomString(3)}`, alt: 'Placeholder Image' }, { type: 'button', text: 'Read Full Story', url: `https://example.co.in/${generateRandomString(5)}` }, { type: 'divider' }, { type: 'text', content: `Spotlight on ${getRandomElement(campaignSubjects)}!` }, { type: 'footer', content: `© ${new Date().getFullYear()} YourNews India. | Manage Preferences | Unsubscribe` }] }


// --- Main Seeding Function ---
async function main() {
  console.log(`Starting seeding process for ${TARGET_USERS} users.`);
  console.log(`Each user will have >= ${MIN_SUBSCRIBERS_PER_USER} subscribers.`);
  console.log(`Subscribers will be created in batches of ${SUBSCRIBER_BATCH_SIZE}.`);

  const overallStartTime = Date.now();

  // --- Counters ---
  const counts = { users: 0, accounts: 0, subscribers: 0, campaigns: 0, campaignStats: 0, emailTemplates: 0, newsletters: 0, subscriptionForms: 0, segments: 0 };

  // --- Clean up existing data (Use with extreme caution!) ---
  console.log('\nPhase 1: Deleting existing data (optional)...');
  const deleteStartTime = Date.now();
  // Uncomment block to enable deletion
  await prisma.campaignStats.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.subscriptionForm.deleteMany({});
  await prisma.newsletter.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.subscriber.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  console.log(`Existing data deleted in ${(Date.now() - deleteStartTime) / 1000}s.`);

  console.log('Deletion phase skipped (commented out).');


  // --- Seed Users ---
  console.log(`\nPhase 2: Seeding ${TARGET_USERS} Users...`);
  const userStartTime = Date.now();
  const users = [];
  for (let i = 0; i < TARGET_USERS; i++) {
    const firstName = getRandomElement(indianFirstNames);
    const lastName = getRandomElement(indianLastNames);
    const shouldHavePassword = Math.random() > 0.1; // 90% have password

    const userPassword = "Password123"
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    try {
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: generateUserEmail(firstName, lastName, i), // Use robust email generator
          emailVerified: Math.random() > 0.3 ? new Date() : null, // ~70% verified
          password: hashedPassword, // Fixed password or null
          image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName}%20${lastName}&backgroundColor=f1f4f5,ffdfbf,c0aede,d1d4f9,b6e3f4`,
        },
      });
      users.push(user);
      counts.users++;
      if ((i + 1) % 100 === 0 || i === TARGET_USERS - 1) {
        const elapsed = (Date.now() - userStartTime) / 1000;
        console.log(`  Created user ${i + 1}/${TARGET_USERS} (${elapsed.toFixed(1)}s elapsed)`);
      }
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.warn(`Skipping user ${i + 1} due to potential duplicate email.`);
      } else {
        console.error(`Error creating user ${i + 1}:`, error);
      }
    }
  }
  console.log(`Seeded ${counts.users} users in ${(Date.now() - userStartTime) / 1000}s.`);


  // --- Seed Related Data Per User ---
  console.log(`\nPhase 3: Seeding related data for ${counts.users} users...`);
  const relatedDataStartTime = Date.now();

  for (const [userIndex, user] of users.entries()) {
    const userProcessStartTime = Date.now();
    console.log(`\nProcessing User ${userIndex + 1}/${counts.users} (${user.email})...`);
    let userSubscriberCount = 0;
    const userSubscriberIdsSample = []; // Store sample IDs for linking

    // --- Seed Subscribers (BATCHED) ---
    const totalSubscribersNeeded = MIN_SUBSCRIBERS_PER_USER + getRandomInt(0, 500); // Add slight variation
    const numBatches = Math.ceil(totalSubscribersNeeded / SUBSCRIBER_BATCH_SIZE);
    console.log(`  Creating ${totalSubscribersNeeded} subscribers in ${numBatches} batches...`);
    const subBatchStartTime = Date.now();

    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
      const batchStartTime = Date.now();
      const subscribersInBatch = [];
      const startSubIndex = batchNum * SUBSCRIBER_BATCH_SIZE;
      const endSubIndex = Math.min(startSubIndex + SUBSCRIBER_BATCH_SIZE, totalSubscribersNeeded);

      for (let subIndex = startSubIndex; subIndex < endSubIndex; subIndex++) {
        const subFirstName = getRandomElement(indianFirstNames);
        const subLastName = getRandomElement(indianLastNames);
        const subscriberCity = getRandomElement(indianCities);
        subscribersInBatch.push({
          userId: user.id,
          email: generateSubscriberEmail(subFirstName, subLastName, userIndex, subIndex),
          firstName: subFirstName,
          lastName: subLastName,
          status: getRandomElement(subscriberStatuses),
          source: getRandomElement(subscriberSources),
          tags: getRandomSubset(commonTags, 0, 4),
          engagementScore: parseFloat((Math.random() * 5).toFixed(2)),
          subscribedAt: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000), // Within last 2 years
          customFields: { city: subscriberCity, signupSource: getRandomElement(['popup', 'footer', 'blog', 'import', 'api']) }
        });
      }

      try {
        // Use createMany with skipDuplicates
        const result = await prisma.subscriber.createMany({
          data: subscribersInBatch,
          // Important to handle potential (though unlikely) collisions
        });
        counts.subscribers += result.count;
        userSubscriberCount += result.count;
        if (batchNum === 0 && result.count > 0) {
          // Get IDs from the *first* successfully created batch for sampling
          const createdSample = await prisma.subscriber.findMany({
            where: { userId: user.id, email: { in: subscribersInBatch.slice(0, SAMPLE_SUBSCRIBER_LINK_COUNT).map(s => s.email) } },
            take: SAMPLE_SUBSCRIBER_LINK_COUNT,
            select: { id: true }
          });
          userSubscriberIdsSample.push(...createdSample.map(s => s.id));
        }
        console.log(`    Batch ${batchNum + 1}/${numBatches}: Created ${result.count} subscribers (${((Date.now() - batchStartTime) / 1000).toFixed(1)}s)`);
      } catch (error) {
        console.error(`    Error creating subscriber batch ${batchNum + 1} for user ${user.email}:`, error);
      }
    }
    console.log(`  Finished creating ${userSubscriberCount} subscribers for user ${user.email} in ${((Date.now() - subBatchStartTime) / 1000).toFixed(1)}s.`);


    // --- Seed OTHER related data for this user (now that subscribers exist) ---
    const sampleIdsToConnect = userSubscriberIdsSample.map(id => ({ id }));
    console.log(`  Seeding other models (linking sample of ${sampleIdsToConnect.length} subscribers)...`);

    // Seed Accounts (1 per user, ~80% chance)
    if (Math.random() < 0.8) { /* (Keep logic from previous script) */ } // Counts.accounts++;

    // Seed Campaigns (Ensure multiple)
    const numCampaigns = getRandomInt(3, 7); // Guarantee 3-7 campaigns
    for (let i = 0; i < numCampaigns; i++) {
      const isSent = Math.random() < 0.7; // 70% sent
      const campaignStatus = isSent ? 'sent' : getRandomElement(['draft', 'scheduled', 'archived']);
      const campaign = await prisma.campaign.create({
        data: {
          userId: user.id,
          name: `${getRandomElement(['Q3 Marketing', 'Festive Push', 'New Feature', 'Regional'])} Campaign ${userIndex}-${i}`,
          subject: getRandomElement(campaignSubjects),
          content: `<p>Namaste {{firstName | default: 'Subscriber'}},</p><p>Updates relevant to ${getRandomElement(indianCities)} inside! ${generateRandomString(50)}</p><p>Best,<br/>Team ${user.name?.split(' ')[0] ?? 'App'}</p>`,
          status: campaignStatus,
          sentAt: campaignStatus === 'sent' ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : null, // Sent within last 3 months
          scheduledAt: campaignStatus === 'scheduled' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          audiences: { connect: sampleIdsToConnect }, // Link sample subscribers
          stats: campaignStatus === 'sent' ? { /* (Keep create stats logic) */ create: { sent: SAMPLE_SUBSCRIBER_LINK_COUNT, delivered: Math.floor(SAMPLE_SUBSCRIBER_LINK_COUNT * 0.98), opened: Math.floor(SAMPLE_SUBSCRIBER_LINK_COUNT * 0.2), clicked: Math.floor(SAMPLE_SUBSCRIBER_LINK_COUNT * 0.05), unsubscribed: getRandomInt(0, 1), bounced: getRandomInt(0, 2), complaints: getRandomInt(0, 1) } } : undefined
        }
      });
      counts.campaigns++;
      if (campaign.status === 'sent') counts.campaignStats++;
    }

    // Seed Segments (Ensure multiple)
    const numSegments = getRandomInt(2, 5);
    for (let i = 0; i < numSegments; i++) {
      await prisma.segment.create({
        data: {
          userId: user.id,
          name: `${getRandomElement(segmentNames)} ${userIndex}-${i}`,
          description: `Segment for user ${userIndex + 1}`,
          rules: createSegmentRulesExample(getRandomElement(indianCities)),
          subscribers: { connect: sampleIdsToConnect }, // Link sample subscribers
        }
      });
      counts.segments++;
    }

    // Seed Email Templates (Ensure multiple)
    const numTemplates = getRandomInt(4, 8);
    for (let i = 0; i < numTemplates; i++) {
      await prisma.emailTemplate.create({ /* (Keep create template logic) */ data: { userId: user.id, name: `Template ${userIndex}-${i}`, content: `HTML...`, category: getRandomElement(templateCategories) } });
      counts.emailTemplates++;
    }

    // Seed Newsletters (Ensure multiple)
    const numNewsletters = getRandomInt(2, 4);
    for (let i = 0; i < numNewsletters; i++) {
      await prisma.newsletter.create({ /* (Keep create newsletter logic) */ data: { userId: user.id, name: `Newsletter ${userIndex}-${i}`, elements: createNewsletterElements(), subject: `Subject ${i}`, status: getRandomElement(newsletterStatuses) } });
      counts.newsletters++;
    }

    // Seed Subscription Forms (Ensure multiple)
    const numForms = getRandomInt(3, 6);
    for (let i = 0; i < numForms; i++) {
      await prisma.subscriptionForm.create({ /* (Keep create form logic, ensure unique formKey) */ data: { userId: user.id, name: `Form ${userIndex}-${i}`, fields: createFormFieldsExample(), settings: createJsonFieldExample(), style: createJsonFieldExample(), status: getRandomElement(formStatuses), formKey: generateRandomString(12) + userIndex + i, views: getRandomInt(1000, 50000), submissions: getRandomInt(50, 5000) } });
      counts.subscriptionForms++;
    }

    const userProcessTime = (Date.now() - userProcessStartTime) / 1000;
    console.log(`Finished processing User ${userIndex + 1}/${counts.users} in ${userProcessTime.toFixed(1)}s. Total Subscribers: ${userSubscriberCount}`);

  } // End loop through users

  const overallTime = (Date.now() - overallStartTime) / 1000;
  console.log(`\n--------------------`);
  console.log(`Seeding finished in ${overallTime.toFixed(1)} seconds (${(overallTime / 60).toFixed(1)} minutes).`);
  console.log(`Final Counts:`);
  console.log(`  Users:            ${counts.users}`);
  console.log(`  Accounts:         ${counts.accounts}`);
  console.log(`  Subscribers:      ${counts.subscribers} (Target: ${TARGET_USERS * MIN_SUBSCRIBERS_PER_USER}+)`);
  console.log(`  Campaigns:        ${counts.campaigns}`);
  console.log(`  Campaign Stats:   ${counts.campaignStats}`);
  console.log(`  Email Templates:  ${counts.emailTemplates}`);
  console.log(`  Newsletters:      ${counts.newsletters}`);
  console.log(`  Subscription Forms: ${counts.subscriptionForms}`);
  console.log(`  Segments:         ${counts.segments}`);
  console.log(`--------------------`);

}

// --- Execute Seeding ---
main()
  .catch((e) => {
    console.error('\n!!! Critical Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('\nDisconnecting Prisma Client...');
    await prisma.$disconnect();
  });
