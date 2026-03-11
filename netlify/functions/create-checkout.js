const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const priceMap = {
  'Emergency Prep':        'price_1T9FfP8YiSVjQv1TvVfLM2u9',
  'Policy & Procedure':    'price_1T9FfN8YiSVjQv1Tqm6YYLQZ',
  'Staff Training':        'price_1T9FfL8YiSVjQv1TbzZWDmog',
  'Templates':             'price_1T9FfJ8YiSVjQv1TQdK71YLF',
  'Opening Kit':           'price_1T9FfH8YiSVjQv1TUMzQ0rws',
  'Audit Shield':          'price_1T9A3c8YiSVjQv1TlZNFcESu',
  'Northwall Bundle':      'price_1T9Fep8YiSVjQv1TZB2cKel1',
  'RAL Path to Licensure': 'price_1T9FAK8YiSVjQv1ToLvpCki0'
};

exports.handler = async (event) => {
  try {
    const { cart } = JSON.parse(event.body);

    if (!cart || cart.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart is empty' })
      };
    }

    // Filter out any items that don't have a matching Stripe price ID
    const line_items = cart
      .filter(item => priceMap[item.name])  // ← THIS was the missing fix
      .map(item => ({
        price: priceMap[item.name],
        quantity: item.qty
      }));

    if (line_items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No valid items in cart' })
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://northwallgroup.com/success.html',
      cancel_url: 'https://northwallgroup.com/binders.html',
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error('Stripe error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
