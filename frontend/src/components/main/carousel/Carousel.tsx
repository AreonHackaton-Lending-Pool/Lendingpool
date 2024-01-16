import { Carousel } from "react-responsive-carousel";

export default () => (
    <Carousel autoPlay infiniteLoop showThumbs={false} swipeable={true}>
        {/* <div className="mx-10">
            <img alt="legend1" src="https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=300" className="h-[60vh]" />
            <div className="bg-transparent text-white border p-4  rounded">
                <h6 className="text-2xl">Catchphrase</h6>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum cumque unde expedita ullam quisquam consequuntur blanditiis dolorum qui beatae maxime!</p>
            </div>
        </div> */}
        <div className="relative ">
            <img alt="legend2" src="https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=300" className="h-[60vh]" />
            <div className="bg-transparent text-white border p-4  rounded absolute bottom-[35%] backdrop-blur-md">
                <h6 className="text-2xl ">Catchphrase</h6>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum cumque unde expedita ullam quisquam consequuntur blanditiis dolorum qui beatae maxime!</p>
            </div>
        </div>
        <div className="relative ">
            <img alt="legend2" src="https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=300" className="h-[60vh]" />
            <div className="bg-transparent text-white border p-4  rounded absolute bottom-[35%] backdrop-blur-md">
                <h6 className="text-2xl text-red-600 ">Catchphrase</h6>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum cumque unde expedita ullam quisquam consequuntur blanditiis dolorum qui beatae maxime!</p>
            </div>
        </div>
        {/* <div className="relative ">
            <img alt="legend2" src="https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=300" className="h-[60vh]" />
            <div className="bg-transparent text-white border p-4  rounded absolute bottom-[35%] right-[-15%] w-3/12 backdrop-blur-md">
                <h6 className="text-2xl w-1/4 border-0 outline-none">Catchphrase</h6>
                <p className="w-1/4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum cumque unde expedita ullam quisquam consequuntur blanditiis dolorum qui beatae maxime!</p>
            </div>
        </div> */}
        {/* <div>
            <img alt=" legend3" src="https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=300" className="h-[60vh]" />
            <p className="legend">Legend 3</p>
        </div> */}
    </Carousel>
);
