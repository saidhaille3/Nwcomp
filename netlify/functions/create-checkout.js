
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map your website item names to your Stripe Price IDs
const priceMap = {
  'Emergency Prep': 'price_1T9FfP8YiSVjQv1TvVfLM2u9',
  'Policy & Procedure': 'price_1T9FfN8YiSVjQv1Tqm6YYLQZ',
  'Staff Training': 'price_1T9FfL8YiSVjQv1TbzZWDmog',
  'Templates': 'price_1T9FfJ8YiSVjQv1TQdK71YLF',
  'Opening Kit': 'price_1T9FfH8YiSVjQv1TUMzQ0rws',
  'Audit Shield': 'price_1T9A3c8YiSVjQv1TlZNFcESu',
  'Northwall Bundle': 'price_1T9Fep8YiSVjQv1TZB2cKel1',
  'RAL Path to Licensure': 'price_1T9FAK8YiSVjQv1ToLvpCki0'
};

exports.handler = async (event) => {
  const { cart } = JSON.parse(event.body);

  // Convert your cart items into Stripe format
  const line_items = cart.map(item => ({
    price: priceMap[item.name],
    quantity: item.qty
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: 'https://northwallgroup.com/success.html',
      cancel_url: 'https://northwallgroup.com/checkout.html',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
