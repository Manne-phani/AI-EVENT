const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to generate high-quality mock responses tailored to the inputs
const generateMockResponse = (input) => {
  const { eventType, guestCount, mainCakeType, preferences, dietaryRestrictions = [], budgetRange, specialInstructions } = input;
  
  const restrictionsList = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : JSON.parse(dietaryRestrictions || '[]');
  const dietaryStr = restrictionsList.length > 0 ? ` (${restrictionsList.join(', ')} friendly)` : '';

  // Tailor pastries, desserts, snacks, beverages based on the event type
  let pastries = [];
  let desserts = [];
  let snacks = [];
  let beveragePairing = [];
  let whyThesePairingsWork = '';
  let extraRecommendation = '';

  const costCategory = budgetRange || 'Premium';

  if (eventType === 'Wedding') {
    pastries = [
      { name: `Vanilla Bean Eclairs${dietaryStr}`, description: "Glazed in rich white chocolate with edible gold dust, offering a sophisticated pastry look.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: `Premium French Macarons`, description: "Delicate and colorful almond flour cookies to match your reception palette.", quantity: `${Math.ceil(guestCount * 1.2)} pcs` }
    ];
    desserts = [
      { name: `Champagne Strawberry Mousse Cups${dietaryStr}`, description: "Creamy layered mousse infused with strawberry purée and a champagne splash.", quantity: `${Math.ceil(guestCount * 0.7)} cups` },
      { name: `Vanilla Bean Crème Brûlée Shooters`, description: "Mini cups of classic rich custard featuring a caramelized sugar crust.", quantity: `${Math.ceil(guestCount * 0.6)} shooters` }
    ];
    snacks = [
      { name: "Savory Prosciutto & Fig Flatbreads", description: "Bite-sized flatbreads bringing a balanced, luxury savory taste.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: "Artisanal Cheese & Fresh Grape Boards", description: "Catering trays loaded with brie, cheddar, crackers, and grape clusters.", quantity: `${Math.ceil(guestCount / 15)} platters` }
    ];
    beveragePairing = [
      { name: "Chilled French Champagne", description: "Acidity cuts through sweet icings to refresh the palate during toasts.", quantity: `${Math.ceil(guestCount * 0.8)} glasses` },
      { name: "Sparkling Elderflower & Peach Pressé", description: "Light, floral non-alcoholic carbonated fruit drink.", quantity: `${Math.ceil(guestCount * 0.8)} glasses` }
    ];
    whyThesePairingsWork = "A grand wedding reception requires visual elegance and high-end treats. Classic gold-dusted eclairs and crème brûlée shooters provide a luxurious dessert display, balanced by savory prosciutto flatbreads and crisp sparkling champagne.";
    extraRecommendation = "Add a Cakes & Crunches 5-Tier Macaron Centerpiece Tower (120 pcs) in custom wedding theme colors.";
  } else if (eventType === 'Birthday' || eventType === 'Kids Party') {
    pastries = [
      { name: `Glazed Sprinkles Donuts${dietaryStr}`, description: "Bite-sized ring donuts coated in colorful vanilla icing and sprinkles.", quantity: `${Math.ceil(guestCount * 1.0)} pcs` },
      { name: `Chocolate Chip Mini Croissants`, description: "Flaky morning croissants filled with sweet chocolate drops.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` }
    ];
    desserts = [
      { name: `Custom Theme Cake Pops${dietaryStr}`, description: "Easy-to-hold cake pops decorated to match your birthday theme colors.", quantity: `${Math.ceil(guestCount * 1.2)} pcs` },
      { name: `Mini Cupcakes with Buttercream Swirls`, description: "Assorted chocolate and vanilla cupcakes topped with rich whipped frosting.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` }
    ];
    snacks = [
      { name: "Pretzel Sticks with Cheese Dip", description: "Salty pretzel twists served with warm cheddar cheese dipping sauce.", quantity: `${Math.ceil(guestCount * 0.7)} servings` },
      { name: "Mini Cheddar Slider Buns", description: "Bite-sized warm cheese sliders, a huge favorite for birthday parties.", quantity: `${Math.ceil(guestCount * 1.0)} pcs` }
    ];
    beveragePairing = [
      { name: "Fresh Berry Party Punch", description: "Sweet carbonated punch made from blended strawberries, lemons, and soda.", quantity: `${Math.ceil(guestCount * 1.0)} cups` },
      { name: "Double Chocolate Milkshakes", description: "Creamy cold milkshakes blended with chocolate crumbs.", quantity: `${Math.ceil(guestCount * 0.5)} cups` }
    ];
    whyThesePairingsWork = "Birthdays are playful and festive. Bite-sized cake pops and mini cupcakes minimize plate mess and are easy for guests to grab, while pretzel dips and sliders balance the sweet cupcakes.";
    extraRecommendation = "Add our Cakes & Crunches Custom Sugar Cookie Pack (30 pcs) customized with the birthday guest's age or name.";
  } else if (eventType === 'Corporate Event') {
    pastries = [
      { name: `Assorted Danish Pastry Basket${dietaryStr}`, description: "Flaky puff pastries featuring apricot, apple, and cream fillings.", quantity: `${Math.ceil(guestCount * 0.6)} baskets` },
      { name: `Baked Almond Croissants`, description: "Toasted sliced almonds topping a light almond-cream filled pastry.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` }
    ];
    desserts = [
      { name: `Zesty Lemon Curd Tartlets${dietaryStr}`, description: "Shortbread crust filled with smooth, zesty lemon curd.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: `Dark Chocolate Brownie Squares`, description: "Rich, dense chocolate brownies portioned into neat, clean bites.", quantity: `${Math.ceil(guestCount * 0.8)} squares` }
    ];
    snacks = [
      { name: "Spinach & Feta Mini Quiches", description: "Warm flaky pastry cups with spinach, cream, and Greek feta.", quantity: `${Math.ceil(guestCount * 0.9)} pcs` },
      { name: "Fresh Fruit Skewers with Honey Drizzle", description: "Clean cubes of melon, pineapple, and strawberries on skewers.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` }
    ];
    beveragePairing = [
      { name: "Cold Brew Coffee Bar", description: "Rich, smooth cold extraction coffee served with choice of milk syrups.", quantity: `${Math.ceil(guestCount * 0.8)} cups` },
      { name: "Jasmine Green Iced Tea", description: "Refreshing, lightly sweetened iced green tea to keep energy high.", quantity: `${Math.ceil(guestCount * 0.6)} glasses` }
    ];
    whyThesePairingsWork = "Corporate gatherings require clean, portioned, bite-sized items that can be eaten cleanly while networking. The lemon tartlets and quiches offer quick bites, paired with refreshing cold brew to keep focus high.";
    extraRecommendation = "Upgrade to our Cakes & Crunches Premium Corporate Pastry Box, featuring custom brand-colored macarons with your company logo.";
  } else if (eventType === 'Festival') {
    pastries = [
      { name: `Butterscotch Cardamom Tarts${dietaryStr}`, description: "Creamy tarts spiced with freshly ground cardamom seeds, offering a rich festive aroma.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: `Almond & Pistachio Baklava Swirls`, description: "Crispy layers of phyllo dough loaded with crushed nuts and sweet honey syrup.", quantity: `${Math.ceil(guestCount * 0.9)} pcs` }
    ];
    desserts = [
      { name: `Spiced Pistachio Fudge Shooters${dietaryStr}`, description: "Dense, aromatic fudge cups topped with crushed roasted pistachios.", quantity: `${Math.ceil(guestCount * 0.6)} cups` },
      { name: `Saffron Cardamom Milk Cakes`, description: "Spongy cake slices soaked in saffron milk and glazed in whipped cream.", quantity: `${Math.ceil(guestCount * 0.7)} slices` }
    ];
    snacks = [
      { name: "Roasted Spiced Masala Cashews", description: "Crunchy cashews tossed in cumin, chili, and sea salt, served in bowls.", quantity: `${Math.ceil(guestCount * 0.5)} bowls` },
      { name: "Mini Vegetable Samosa Chaat Bites", description: "Crisp potato samosa pastries topped with mint and tamarind chutneys.", quantity: `${Math.ceil(guestCount * 0.9)} pcs` }
    ];
    beveragePairing = [
      { name: "Traditional Masala Chai", description: "Warm, robust spiced tea brewed with ginger, cinnamon, and cardamom.", quantity: `${Math.ceil(guestCount * 0.8)} cups` },
      { name: "Mango Mint Lassi Mocktail", description: "Chilled yogurt smoothie blended with ripe mango pulp and mint.", quantity: `${Math.ceil(guestCount * 0.6)} glasses` }
    ];
    whyThesePairingsWork = "Festival menus celebrate rich spices and cultural fusion. Aromatic cardamom and saffron desserts complement warm butterscotch or vanilla base cakes, while hot spiced chai balances the sweet profile.";
    extraRecommendation = "Add a Cakes & Crunches Festive Gift Hamper containing 24 premium spiced dry-fruit cookies.";
  } else if (eventType === 'Anniversary') {
    pastries = [
      { name: `Strawberry Mille-Feuille${dietaryStr}`, description: "Layered puff pastry with rich vanilla custard and fresh strawberry slices.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` },
      { name: `Rose Water Cream Eclairs`, description: "Choux pastry filled with floral rose water cream and glazed in pink chocolate.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` }
    ];
    desserts = [
      { name: `Dark Chocolate Mousse Cups${dietaryStr}`, description: "Rich, velvety dark chocolate mousse topped with fresh raspberry compote.", quantity: `${Math.ceil(guestCount * 0.7)} cups` },
      { name: `Red Velvet Truffle Hearts`, description: "Heart-shaped rich red velvet cake crumbs bound with cream cheese and dipped in white chocolate.", quantity: `${Math.ceil(guestCount * 1.0)} pcs` }
    ];
    snacks = [
      { name: "Smoked Salmon & Herb Cream Canapés", description: "Bite-sized toasted baguettes topped with smoked salmon, dill, and cream cheese.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: "Salted Caramel Pecan Tartlets", description: "Crispy tart shells filled with sweet caramel, toasted pecans, and sea salt.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` }
    ];
    beveragePairing = [
      { name: "Sparkling Rosé Wine", description: "Effervescent dry pink wine that elevates romantic anniversary toasts.", quantity: `${Math.ceil(guestCount * 0.8)} glasses` },
      { name: "Chilled Espresso Martinis", description: "A sophisticated cocktail blending rich espresso, vodka, and coffee liqueur.", quantity: `${Math.ceil(guestCount * 0.5)} glasses` }
    ];
    whyThesePairingsWork = "Anniversaries call for romantic, deep flavors. Rich cocoa and dark chocolate match chocolate/red velvet centerpiece themes, paired with sparkling rose for an elegant toast.";
    extraRecommendation = "Add our Signature Cakes & Crunches Romantic Chocolate Fondue Platter with strawberries and marshmallows.";
  } else if (eventType === 'Baby Shower') {
    pastries = [
      { name: `Mini Blueberry Scones${dietaryStr}`, description: "Lightly sweetened scones served with clotted cream and lemon curd.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` },
      { name: `Vanilla Custard Cream Puffs`, description: "Choux pastry puffs loaded with fresh vanilla custard and dusted with sugar.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` }
    ];
    desserts = [
      { name: `Pastel Colored Macarons${dietaryStr}`, description: "Almond macarons in soft pastel pinks and blues to match baby shower decor.", quantity: `${Math.ceil(guestCount * 1.2)} pcs` },
      { name: `Strawberry Cream Panna Cotta`, description: "Chilled, smooth milk gelatin cups layered with fresh strawberry sauce.", quantity: `${Math.ceil(guestCount * 0.7)} cups` }
    ];
    snacks = [
      { name: "Mini Cucumber & Herb Sandwiches", description: "Dainty crustless sandwiches filled with cream cheese, herbs, and cucumber slices.", quantity: `${Math.ceil(guestCount * 1.0)} pcs` },
      { name: "Sweet Caramel Popcorn Bowls", description: "Crunchy sweet snack served in decorative baby shower bowls.", quantity: `${Math.ceil(guestCount * 0.5)} bowls` }
    ];
    beveragePairing = [
      { name: "Chilled Peach & Mint Iced Tea", description: "Refreshing tea brewed with sweet peaches and fresh mint sprigs.", quantity: `${Math.ceil(guestCount * 0.8)} glasses` },
      { name: "Sparkling Pink Lemonade Mocktail", description: "Zesty lemon juice, sugar, and sparkling water with a splash of cranberry.", quantity: `${Math.ceil(guestCount * 0.9)} glasses` }
    ];
    whyThesePairingsWork = "Baby showers call for a delicate, soothing tea-party aesthetic. Soft fruit tarts, cream puffs, and cucumber finger sandwiches pair wonderfully with light peach iced tea.";
    extraRecommendation = "Add a Cakes & Crunches Custom Baby Shower Sugar Cookie Platter (30 pcs) shaped like pacifiers and strollers.";
  } else {
    // Housewarming / Default
    pastries = [
      { name: `Warm Cinnamon Buns${dietaryStr}`, description: "Spiced cinnamon rolls glazed in sweet vanilla cream cheese frosting.", quantity: `${Math.ceil(guestCount * 0.8)} pcs` },
      { name: `Glazed Apple Turnovers`, description: "Flaky puff pastry turnovers loaded with spiced apple compote.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` }
    ];
    desserts = [
      { name: `Mini Pecan Pie Bites${dietaryStr}`, description: "Rich, nutty pecan pies baked into bite-sized shortcrust shells.", quantity: `${Math.ceil(guestCount * 0.6)} pcs` },
      { name: `Vanilla Bean Mini Cheesecakes`, description: "Individual graham cracker crusts topped with creamy vanilla bean cheesecake.", quantity: `${Math.ceil(guestCount * 0.7)} pcs` }
    ];
    snacks = [
      { name: "Gourmet Charcuterie Platters", description: "Salami slices, cheddar, crackers, olives, and almonds arranged on boards.", quantity: `${Math.ceil(guestCount / 12)} platters` },
      { name: "Warm Garlic Butter Knots", description: "Freshly baked bread rolls brushed with garlic butter and herbs.", quantity: `${Math.ceil(guestCount * 0.8)} knots` }
    ];
    beveragePairing = [
      { name: "Warm Apple Cider", description: "Aromatic mulled apple juice simmered with cinnamon, cloves, and orange slices.", quantity: `${Math.ceil(guestCount * 0.8)} mugs` },
      { name: "Chilled Cucumber Lime Water", description: "Crisp, refreshing infused water to balance the buttery baked pastries.", quantity: `${Math.ceil(guestCount * 0.6)} glasses` }
    ];
    whyThesePairingsWork = "Housewarming menus create a cozy, welcoming atmosphere. Cinnamon buns and apple cider evoke a 'home-baked' comfort, balanced by savory garlic knots and charcuterie platters.";
    extraRecommendation = "Add our Welcome Bakery Pack featuring 2 loaves of fresh sourdough, gourmet butter, and local honey.";
  }

  // Handle special dietary modifications
  if (restrictionsList.includes('Vegan')) {
    pastries = pastries.map(p => ({ ...p, name: p.name.includes('Vegan') ? p.name : `Vegan ${p.name}` }));
    desserts = desserts.map(d => ({ ...d, name: d.name.includes('Vegan') ? d.name : `Vegan ${d.name}` }));
    beveragePairing = beveragePairing.map(b => ({ ...b, name: b.name.includes('Plant-based') ? b.name : `${b.name} (with plant milk)` }));
  }
  if (restrictionsList.includes('Sugar-Free')) {
    pastries = pastries.map(p => ({ ...p, name: `${p.name} (Sugar-Free)` }));
    desserts = desserts.map(d => ({ ...d, name: `${d.name} (Sugar-Free)` }));
  }

  const specialText = specialInstructions ? ` Incorporating your special request: "${specialInstructions}".` : '';
  const preferenceText = preferences ? ` Tailored for preference: "${preferences}".` : '';

  return {
    eventSummary: `Catering menu for a ${eventType} with ${guestCount} guests, featuring a ${mainCakeType} Cake. Designed for a ${costCategory} budget.${preferenceText}${specialText}`,
    pastries,
    desserts,
    snacks,
    beveragePairing,
    quantitySuggestions: `Based on your guest count of ${guestCount}, we recommend approx. 2-3 small items per guest, totaling around ${Math.ceil(guestCount * 2.5)} individual items, distributed across pastries, desserts, and savory snacks.`,
    whyThesePairingsWork,
    estimatedCostCategory: costCategory,
    extraRecommendation
  };
};

/**
 * Generates pairing recommendations using the Gemini API.
 * Falls back to mock responses if the key is missing or the API returns an error.
 */
const generatePairing = async (input) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('Gemini API key is not configured. Returning premium mock response.');
    // Add a small delay to simulate network call (500ms)
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateMockResponse(input);
  }

  try {
    const { eventType, guestCount, mainCakeType, preferences, dietaryRestrictions = [], budgetRange, specialInstructions } = input;
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const ai = new GoogleGenerativeAI(apiKey);
    
    // Using model gemini-1.5-flash as it's fast and reliable
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const restrictionsList = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : JSON.parse(dietaryRestrictions || '[]');

    const prompt = `
You are the Executive Pastry Chef at "Cakes and Crunches" bakery.
Generate a complete catering menu suggestion based on these inputs:
- Event Type: ${eventType}
- Guest Count: ${guestCount}
- Main Cake Type: ${mainCakeType} Cake
- Dessert Preferences: ${preferences || 'None'}
- Dietary Restrictions: ${restrictionsList.join(', ') || 'None'}
- Budget Range: ${budgetRange}
- Special Instructions: ${specialInstructions || 'None'}

You must respond with a JSON object ONLY, adhering to this schema:
{
  "eventSummary": "A friendly summary of the event catering requirements.",
  "pastries": [
    { "name": "Item name", "description": "Why it pairs well with the main cake/event", "quantity": "Recommended quantity (e.g. 40 pcs)" }
  ],
  "desserts": [
    { "name": "Item name", "description": "Why it pairs well", "quantity": "Recommended quantity" }
  ],
  "snacks": [
    { "name": "Item name", "description": "Why it pairs well", "quantity": "Recommended quantity" }
  ],
  "beveragePairing": [
    { "name": "Drink name", "description": "Why it pairs well", "quantity": "Recommended quantity" }
  ],
  "quantitySuggestions": "A concise explanation of recommended quantities based on the guest count of ${guestCount}.",
  "whyThesePairingsWork": "A brief explanation of why these items complement the ${mainCakeType} cake and the event type.",
  "estimatedCostCategory": "Budget-friendly | Premium | Luxury",
  "extraRecommendation": "An upsell suggestion from Cakes and Crunches (e.g., adding a macaron tower, chocolate fountain, or custom cookie pack)."
}

Make sure the suggested items are bakery-oriented, look premium, fit the budget (${budgetRange}), respect the dietary restrictions (${restrictionsList.join(', ')}), and complement the flavor of the ${mainCakeType} cake. Return ONLY the JSON object. Do not include markdown code blocks or formatting other than a raw JSON string.
`;

    // Set generation options
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const text = result.response.text();
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch (error) {
    console.error('Gemini API call failed, using mock generator fallback. Error:', error.message);
    return generateMockResponse(input);
  }
};

module.exports = {
  generatePairing
};
